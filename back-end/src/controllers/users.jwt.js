import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const controller = {}     // Objeto vazio

// Criando um novo usuario
controller.create = async function(req, res) {
  try {

    // Criptografando a senha
    req.body.password = await bcrypt.hash(req.body.password, 12)
    // Cria o usuário
    await prisma.user.create({ data: req.body })

    // HTTP 201: Created - caso usuário criado com sucesso
    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error - caso retorne erro na criação do usuário
    res.status(500).end()
  }
}

//Retorna todos os usuários 
controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany()

    // Deleta o campo "password", para não ser enviado ao front-end
    for(let user of result) {
      if(user.password) delete user.password
    }

    // HTTP 200: OK (implícito) - retorna uma lista de usuários
    res.send(result)
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}


//Retorna um usuário (por isso retrieveOne)
controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id)}
    })

    // Deleta o campo "password", para não ser enviado ao front-end
    if(result.password) delete result.password

    // Encontrou o usuário: retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou o usuário: retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}


//Update = atualiza o usuário
controller.update = async function (req, res) {
  try {

    // Criptografando o campo password caso o valor tenha sido passado
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}


//Excluindo o usuário
controller.delete = async function (req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não excluiu) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

//Metódo de Login
controller.login = async function(req, res) {

  try {
    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username }
    })
    // Se o usuário não for encontrado, retorna HTTP 401: Unauthorized
    if(! user) return res.status(401).end()
    // Usuário encontrado, vamos conferir a senha
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    // Se a senha não confere ~> HTTP 401: Unauthorized
    if(! passwordMatches) return res.status(401).end()

    // Formamos o token JWT de autenticação para enviar ao front-end com as infos do usuário
    const token = jwt.sign(
      user,   // O token contém as informações do usuário logado
      process.env.TOKEN_SECRET,   // Senha de criptografia do token
      { expiresIn: '24h' }        // Prazo de validade do token
    )

    // Forma o cookie para enviar ao front-end
    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,   // O cookie ficará inacessível para JS no front-end
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000   // 24 horas
    })

    // Envia o token na resposta com código HTTP 200: OK (implícito)
    //res.send({token})

    // HTTP 204: No Content
    res.status(204).end()

  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

//Caso o usuário esteja autenticado obtem as infos dele
controller.me = function(req, res) {

  // Se o usuário autenticado estiver salvo em req,
  // retorna-o
  if(req.authUser) res.send(req.authUser)

  // Senão, retorna HTTP 401: Unauthorized
  else res.status(401).end()
}

//Metodo de deslogar o usuário
controller.logout = function(req, res) {
  // Apaga o cookie que armazena o token de autorização
  res.clearCookie(process.env.AUTH_COOKIE_NAME)
  res.send(204).end()
}

export default controller

// A autenticação por token JWT emprega tokens assinados que estão guardados no navegador do usuário. Para sistemas que precisam escalar facilmente, esses tokens são usados para verificar quem está acessando cada pedido. A autenticação por sessão, por outro lado, emprega um identificador armazenado no navegador, que é utilizado pelo servidor para verificar se a sessão é válida. Embora forneça mais controle sobre o acesso, escalar sem comprometer o servidor pode ser um obstáculo. A maneira como você deve expandir ou proteger seu sistema determina a opção.