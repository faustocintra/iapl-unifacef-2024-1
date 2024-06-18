import prisma from '../database/client.js'  // Importa o cliente do Prisma
import bcrypt from 'bcrypt'                 // Importa bcrypt para criptografar senhas
import jwt from 'jsonwebtoken'              // Importa jwt para tokens de autenticação

const controller = {}     // Objeto vazio para armazenar os métodos do controlador

// Cria um novo usuário
controller.create = async function(req, res) {
  try {
    // Criptografa a senha antes de salvar no banco de dados
    req.body.password = await bcrypt.hash(req.body.password, 12)

    // Cria um novo usuário no banco de dados com os dados recebidos
    await prisma.user.create({ data: req.body })

    // Retorna HTTP 201: Created
    res.status(201).end()
  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Recupera todos os usuários
controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany()

    // Remove o campo "password" dos usuários antes de envia pro front-end
    for(let user of result) {
      if(user.password) delete user.password
    }

    // Retorna HTTP 200: OK (implícito)
    res.send(result)
  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Recupera um único usuário pelo ID
controller.retrieveOne = async function(req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    })

    // Remove o campo "password" do usuário antes de enviar para o front-end
    if(result && result.password) delete result.password

    // Retorna o usuário encontrado com HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Se não encontrar o usuário, retorna HTTP 404: Not Found
    else res.status(404).end()
  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Atualiza um usuário
controller.update = async function(req, res) {
  try {
    // Criptografando a senha se ela foi passada no corpo da requisição
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    // Atualiza o usuário no banco de dados
    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // encontror retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // não encontrar retorna HTTP 404: Not Found
    else res.status(404).end()
  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Deleta um usuário
controller.delete = async function(req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    // encontrar retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // não encontrar retorna HTTP 404: Not Found
    else res.status(404).end()
  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Login de um usuário
controller.login = async function(req, res) {
  try {
    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username }
    })

    // usuário não for encontrado retorna HTTP 401: Unauthorized
    if(!user) return res.status(401).end()

    // Verifica se a senha está correta
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    if(!passwordMatches) return res.status(401).end()

    // Formamos o token de autenticação para enviar pro front-end
    const token = jwt.sign(
      user,   // O token contém as informações do usuário logado
      process.env.TOKEN_SECRET,   // Senha de criptografia do token
      { expiresIn: '24h' }        // Prazo de validade do token
    )

    // Forma o cookie para enviar ao front-end
    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,   // O cookie ficará inacessível para JS no front-end
      secure: true,     // O cookie só será enviado em conexões HTTPS
      sameSite: 'None', // Permite o envio do cookie em cross-site requests
      path: '/',
      maxAge: 24 * 60 * 60 * 1000   // 24 horas
    })

    // Retorna HTTP 204: No Content
    res.status(204).end()

  } catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

controller.me = function(req, res) {
  //usuário autenticado estiver salvo em req.authUser retorna
  if(req.authUser) res.send(req.authUser)
  //retorna HTTP 401: Unauthorized
  else res.status(401).end()
}

// Método para logout do usuário
controller.logout = function(req, res) {
  // Apaga o cookie que armazena o token de autorização
  res.clearCookie(process.env.AUTH_COOKIE_NAME)
  res.status(204).end()
}

export default controller
