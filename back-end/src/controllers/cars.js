import prisma from '../database/client.js'

const controller = {}

/*
 * Aqui tá fessor, as rotas da operação CRUD dos carros.
 * Como a net tá meio ruim, vou usar o postman para mostrar as chamadas das rotas msm.
 */

// [x] demonstrar a criação de um veículo
controller.create = async function (req, res) {
  try {
    await prisma.cars.create({ data: req.body })
    res.status(201).end()
  }
  catch (error) {
    console.error(error)
    res.status(500).end()
  }
}

// [x] fazer a busca dos veículos
controller.retrieveAll = async function (req, res) {
  try {
    const result = await prisma.cars.findMany()
    res.status(500).send(result)
  }
  catch (error) {
    console.error(error)
    res.status(500).end()
  }
}

// [x] fazer o update de um veículo
controller.update = async function (req, res) {
  try {
    const result = await prisma.cars.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    if (result) res.status(204).end()
    else res.status(404).end()
  }
  catch (error) {
    console.error(error)
    res.status(500).end()
  }
}

// [x] fazer a deleção de um veículo
controller.delete = async function (req, res) {
  try {
    const result = await prisma.cars.delete({
      where: { id: Number(req.params.id) }
    })

    if (result) res.status(204).end()
    else res.status(404).end()
  }
  catch (error) {
    console.error(error)
    res.status(500).end()
  }
}

export default controller
