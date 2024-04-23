import jwt from 'jsonwebtoken'
import prisma from '../database/client.js'


const controller = {}

controller.create = async function (req, res) {
  try {
    await prisma.car.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }

  catch (error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function (req, res) {
  try {
    const result = await prisma.car.findMany()

    // HTTP 200: OK
    res.send(result)
  }
  catch (error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.car.findUnique({
      where: { id: Number(req.params.id) }
    })

    // retorna HTTP 200: OK
    if (result) res.send(result)
    // HTTP 404: Not Found
    else res.status(404).end()
  }
  catch (error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function (req, res) {
  try {

    const result = await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // HTTP 204: No Content
    if (result) res.status(204).end()

    // HTTP 404: Not Found
    else res.status(404).end()
  }
  catch (error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.delete = async function (req, res) {
  try {
    const result = await prisma.car.delete({
      where: { id: Number(req.params.id) }
    })

    // HTTP 204: No Content
    if (result) res.status(204).end()

    // HTTP 404: Not Found
    else res.status(404).end()
  }
  catch (error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.login = async function (req, res) {
  try {
    const car = await prisma.car.findUnique({
      where: { model: req.body.owner_name }
    })

    // HTTP 401: Unauthorized
    if (!car) return res.status(401).end()

    const token = jwt.sign(
      owner_name,
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' }
    )

    // HTTP 200: OK (implícito)
    res.send({ token })

  }
  catch (error) {
    console.error(error)
    
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

export default controller
