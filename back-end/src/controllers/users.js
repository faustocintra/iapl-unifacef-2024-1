import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const controller = {} // objeto vazio

controller.create = async function(req, res) {
    try{

        //Criptografando a senha
        req.body.password = await bcrypt.hash(req.body.password, 12)
        await prisma.user.create({ data: req.body })

        // HTTP 201: Created
        res.status(201).end()
    }
    catch(error) {
        console.error(error)
        // HTTP 500: Internal Server Error
        res.status(500).end()
    }
}

controller.retrieveAll = async function(req, res){
    try{
        const result = await prisma.user.findMany()

        // Deleta o campo "password"
        for(let user of result) {
            if(user.password) delete user.password
        }

        //HTTP 200: 0k(implícito)
        res.send(result)
    }
    catch(error) {
        console.error(error)
        // HTTP 500: Internal Server Error
        res.status(500).end()
    }
}

controller.retrieveOne = async function (req, res){
    try{
        const result = await prisma.user.findUnique({
            where: { id: Number(req.params.id)}
        })

        //Deleta o campo password
        if(result.password) delete result.password

        //Encontrou: retorna HTTP 200: OK (implicito)
        if(result) res.send(result)
        //Não encontrou: retorna HTTP 404: Not found
        else res.status(404).end()
    }
    catch(error) {
        console.error(error)
        // HTTP 500: Internal Server Error
        res.status(500).end()
    }
}

controller.update = async function (req,res){
    try{

        if(req.body.password){
            req.body.password = await bcrypt.hash(req.body.password, 12)
        }
        const result = await prisma.user.update ({
            where: { id: Number(req.params.id)},
            data: req.body
        })

        //Encontrou e atualizou: HTTP 204: No contente
        if(result) res.status(204).end()
        //Não encontrou (e naço atualizou): HTTP 404: Not Found
        else res.status(404).end()
    }
    catch(error) {
        console.error(error)
        // HTTP 500: Internal Server Error
        res.status(500).end()
    }
}

controller.delete = async function (req, res){
    try {
        const result = await prisma.user.delete({
            where: { id: Number(req.params.id)}
        })

        //Encontrou e excluiu: HTTP 204: No contente
        if(result) res.status(204).end()
        //Não encontrou (e não excluiu): HTTP 404: Not Found
        else res.status(404).end()
    }
    catch(error) {
        console.error(error)
        // HTTP 500: Internal Server Error
        res.status(500).end()
    }
}

export default controller