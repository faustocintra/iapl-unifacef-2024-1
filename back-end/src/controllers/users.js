import prisma from '../database/client.js'  // Importa o cliente Prisma para interações com o banco de dados
import bcrypt from 'bcrypt'                 // Importa bcrypt para criptografia de senhas
import { uuidv7 } from 'uuidv7'              // Importa a função para gerar UUIDs versão 7
import Cryptr from 'cryptr'                 // Importa Cryptr para criptografia

const controller = {}  // Cria um objeto vazio que conterá os métodos do controlador

// Método para criar um novo usuário
controller.create = async function(req, res) {
  try {
    // Criptografa a senha antes de salvar no banco de dados
    req.body.password = await bcrypt.hash(req.body.password, 12)

    // Cria um novo usuário no banco de dados com os dados do corpo da requisição
    await prisma.user.create({ data: req.body })

    // Retorna status HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para recuperar todos os usuários
controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany()

    // Remove o campo "password" dos dados retornados
    for(let user of result) {
      if(user.password) delete user.password
    }

    // Retorna os usuários com status HTTP 200: OK
    res.send(result)
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para recuperar um usuário específico por ID
controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id)}
    })

    // Remove o campo "password" dos dados retornados
    if(result.password) delete result.password

    // Se encontrou o usuário, retorna os dados com status HTTP 200: OK
    if(result) res.send(result)
    // Se não encontrou, retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para atualizar um usuário específico por ID
controller.update = async function (req, res) {
  try {
    // Se a senha foi passada no corpo da requisição, criptografa antes de salvar
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    // Atualiza o usuário no banco de dados
    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Se encontrou e atualizou o usuário, retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // Se não encontrou o usuário, retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para excluir um usuário específico por ID
controller.delete = async function (req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    // Se encontrou e excluiu o usuário, retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // Se não encontrou o usuário, retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para login de usuário
controller.login = async function(req, res) {
  try {
    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username }
    })
    // Se o usuário não for encontrado, retorna HTTP 401: Unauthorized
    if(!user) return res.status(401).end()

    // Verifica se a senha fornecida confere com a senha armazenada
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    // Se a senha não confere, retorna HTTP 401: Unauthorized
    if(!passwordMatches) return res.status(401).end()

    // Cria uma nova sessão para o usuário autenticado
    const sessid = uuidv7()  // Gera um UUID para a sessão
    await prisma.session.create({ data: { sessid, user_id: user.id } })

    // Cria um cookie com o sessid criptografado para enviar ao front-end
    const cryptr = new Cryptr(process.env.TOKEN_SECRET)
    res.cookie(process.env.AUTH_COOKIE_NAME, cryptr.encrypt(sessid), {
      httpOnly: true,   // O cookie ficará inacessível para JavaScript no front-end
      secure: true,     // O cookie só será enviado em conexões HTTPS
      sameSite: 'None', // Permite o envio do cookie em pedidos cross-site
      path: '/',        // O cookie estará disponível em todas as rotas
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    })

    // Retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    console.error(error)
    // Em caso de erro, retorna HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

// Método para obter o usuário autenticado
controller.me = function(req, res) {
  // Se o usuário autenticado estiver disponível em req.authUser, retorna-o
  if(req.authUser) res.send(req.authUser)
  // Se não, retorna HTTP 401: Unauthorized
  else res.status(401).end()
}

// Método para logout do usuário
controller.logout = function(req, res) {
  // Apaga o cookie que armazena o token de autorização
  res.clearCo
