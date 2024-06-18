import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import { uuidv7 } from 'uuidv7'
import Cryptr from 'cryptr'

const controller = {}     // Objeto vazio para armazenar os métodos

//Cira um novo usuário
controller.create = async function(req, res) {
  try {
    // Criptografando a senha antes de salvar no banco de dados
    req.body.password = await bcrypt.hash(req.body.password, 12)

    // Criando um novo usuário no banco de dados com os dados recebidos
    await prisma.user.create({ data: req.body })

    // Retorna HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Recupera todos os usuários
controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany()

    // Remove o campo "password" dos usuários antes de enviar para o front-end
    for(let user of result) {
      if(user.password) delete user.password
    }

    // Retorna HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Recupera um único usuário pelo ID
controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id)}
    })

    // Remove o campo "password" do usuário antes de enviar para o front-end
    if(result.password) delete result.password

    // Retorna o usuário encontrado com HTTP 200: OK (implícito)
    if(result) res.send(result)
    // não encontrar o usuário, retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Atualiza um usuário
controller.update = async function (req, res) {
  try {
    // Criptogra a senha se ela foi passada no corpo da requisição
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    // Atualiza o usuário no banco de dados
    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // encontrar e atualizar, retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // não encontrar, retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

//Deletaa um usuário
controller.delete = async function (req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    // deletou, retorna HTTP 204: No Content
    if(result) res.status(204).end()
    // retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
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

    // usuário não for encontrado, retorna HTTP 401: Unauthorized
    if(! user) return res.status(401).end()

    // Verifica se a senha está correta
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    if(! passwordMatches) return res.status(401).end()

    // Cria uma sessão para o usuário autenticado
    const sessid = uuidv7()   // Geração de um UUID para a sessão
    await prisma.session.create({ data: { sessid, user_id: user.id } })

    // Cria um cookie para enviar ao front-end com o ID da sessão
    const cryptr = new Cryptr(process.env.TOKEN_SECRET)
    res.cookie(process.env.AUTH_COOKIE_NAME, cryptr.encrypt(sessid), {
      httpOnly: true, 
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000   // 24 horas
    })

    // Retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    console.error(error)
    // Retorna HTTP 500: Internal Server Error se houver algum erro
    res.status(500).end()
  }
}

// Obter informações do usuário autenticado
controller.me = function(req, res) {
  // usuário autenticado estiver salvo em req.authUser, retorna-o
  if(req.authUser) res.send(req.authUser)
  // retorna HTTP 401: Unauthorized
  else res.status(401).end()
}

// Logout do usuário
controller.logout = function(req, res) {
  // Apaga o cookie que armazena o token de autorização
  res.clearCookie(process.env.AUTH_COOKIE_NAME)
  res.send(204).end()
}

export default controller
