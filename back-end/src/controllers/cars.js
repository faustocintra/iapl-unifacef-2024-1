import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {

   await prisma.cars.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}


controller.update = async function (req, res) {
  try {

    const result = await prisma.cars.update({
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

controller.delete = async function (req, res) {
  try {
    const result = await prisma.cars.delete({
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

controller.login = async function(req, res) {
  try {
    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username }
    })
    // Se o usuário não for encontrado, retorna
    // HTTP 401: Unauthorized
    if(! user) return res.status(401).end()
    // Usuário encontrado, vamos conferir a senha
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    // Se a senha não confere ~> HTTP 401: Unauthorized
    if(! passwordMatches) return res.status(401).end()

    // Formamos o token de autenticação para enviar ao front-end
    const token = jwt.sign(
      user,   // O token contém as informações do usuário logado
      process.env.TOKEN_SECRET,   // Senha de criptografia do token
      { expiresIn: '24h' }        // Prazo de validade do token
    )

    // Envia o token na resposta com código HTTP 200: OK (implícito)
    res.send({token})

  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

export default controller