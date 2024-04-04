import prisma from "../database/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const controller = {}; // Objeto vazio

controller.create = async function (req, res) {
  try {
    // Criptografando da senha
    req.body.password = await bcrypt.hash(req.body.password, 12);
    await prisma.user.create({ data: req.body });
    // HTTP 201: Created
    res.status(201).end();
  } catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
};

controller.retrieveAll = async function (req, res) {
  try {
    const result = await prisma.user.findMany();
    // Deleta o campo "password" para não ser enviado ao front-end
    for (let user of result) {
      if(user.password) delete user.password;
    }
    // HTTP 200: OK (implícito)
    res.send(result);
  } catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
};

controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });
    // Deleta o campo "password" para não ser enviado ao front-end
    if (user.password) delete user.password;
    // Encontrou: retorna HTTP 200: OK (implícito)
    if (result) res.send(result);
    // Não encontrou: retorna HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
};

controller.update = async function (req, res) {
  try {
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }
    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
    // Encontrou e atualizou => HTTP 204: No Content
    if (result) res.status(204).end();
    // Não encontrou (e não atualizou) => HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
}

controller.delete = async function (req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) },
    });
    // Encontrou e removeu => HTTP 204: No Content
    if (result) res.status(204).end();
    // Não encontrou (e não removeu) => HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
}

controller.login = async function (req, res) {
  try {
    // busca o usuário pela username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username }
    });
    // se o usuário não for encontrado, retorna HTTP 401: Unauthorized
    if(! user) return res.status(401).end();
    // Usuário encontrado, vamos conferir a senha
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    // se a senha não bater, retorna HTTP 401: Unauthorized
    if (! passwordMatch) return res.status(401).end();

    // Formando token de autenticacao para enviar ao front-end
    const token = jwt.sign(
      user, // O token contém as informações do usuário logado
      process.env.TOKEN_SECRET, // Senha de criptografia do token
      { expiresIn: '24h' } // O token expira em 24 horas
    )

    // Envia o token no na resposta com o código HTTP 200: OK (Implícito)
    res.send({token})
    
  }
  catch (error) {
    console.error(error);
    // HTTP 500: Internal Server Error
    res.status(500).end();
  }
}

export default controller;