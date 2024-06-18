import prisma from "../database/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const controller = {}; // Objeto vazio para armazenar os métodos do controlador

// Método para criar um novo usuário
controller.create = async function (req, res) {
  try {
    // Criptografando a senha antes de salvar no banco de dados
    req.body.password = await bcrypt.hash(req.body.password, 12);

    // Cria um novo usuário no banco de dados
    await prisma.user.create({ data: req.body });

    // Retorna HTTP 201: Created para indicar que o usuário foi criado com sucesso
    res.status(201).end();
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método para recuperar todos os usuários
controller.retrieveAll = async function (req, res) {
  try {
    const result = await prisma.user.findMany();

    // Remove o campo "password" de cada usuário antes de enviar a resposta
    for (let user of result) {
      if (user.password) delete user.password;
    }

    // Retorna a lista de usuários com HTTP 200: OK (implícito)
    res.send(result);
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método para recuperar um único usuário pelo ID
controller.retrieveOne = async function (req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });

    // Remove o campo "password" antes de enviar a resposta
    if (result && result.password) delete result.password;

    // Se o usuário for encontrado, retorna HTTP 200: OK (implícito)
    if (result) res.send(result);
    // Se o usuário não for encontrado, retorna HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método para atualizar um usuário
controller.update = async function (req, res) {
  try {
    // Criptografando a senha caso ela tenha sido passada
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
    }

    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    // Se o usuário for encontrado e atualizado, retorna HTTP 204: No Content
    if (result) res.status(204).end();
    // Se o usuário não for encontrado, retorna HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método para excluir um usuário
controller.delete = async function (req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) },
    });

    // Se o usuário for encontrado e excluído, retorna HTTP 204: No Content
    if (result) res.status(204).end();
    // Se o usuário não for encontrado, retorna HTTP 404: Not Found
    else res.status(404).end();
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método de login
controller.login = async function (req, res) {
  try {
    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: req.body.username },
    });

    // Se o usuário não for encontrado, retorna HTTP 401: Unauthorized
    if (!user) return res.status(401).end();

    // Verifica se a senha está correta
    const passwordMatches = await bcrypt.compare(
      req.body.password,
      user.password
    );

    // Se a senha não estiver correta, retorna HTTP 401: Unauthorized
    if (!passwordMatches) return res.status(401).end();

    // Gera um token JWT com as informações do usuário
    const token = jwt.sign(
      user, // O token contém as informações do usuário logado
      process.env.TOKEN_SECRET, // Senha de criptografia do token
      { expiresIn: "24h" } // Prazo de validade do token
    );

    // Define um cookie com o token para autenticação
    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true, // O cookie ficará inacessível para JS no front-end
      secure: true, // O cookie só será enviado em conexões HTTPS
      sameSite: "None", // Permite o envio do cookie em requisições cross-site
      path: "/", // O cookie estará disponível em todas as rotas
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    // Retorna HTTP 204: No Content para indicar sucesso
    res.status(204).end();
  } catch (error) {
    console.error(error);
    // Retorna HTTP 500: Internal Server Error em caso de erro
    res.status(500).end();
  }
};

// Método para obter informações do usuário autenticado
controller.me = function (req, res) {
  // Se o usuário autenticado estiver salvo em req.authUser, retorna-o
  if (req.authUser) res.send(req.authUser);
  // Se não, retorna HTTP 401: Unauthorized
  else res.status(401).end();
};

// Método para logout
controller.logout = function (req, res) {
  // Apaga o cookie que armazena o token de autorização
  res.clearCookie(process.env.AUTH_COOKIE_NAME);
  // Retorna HTTP 204: No Content para indicar sucesso
  res.status(204).end();
};

export default controller;

// Ao logar, é gerado e enviado um token JWT com validade de 24 horas ao cliente em um cookie após validar as credenciais
// Ao fazer o logout, apaga-se o cookie que armazena o token JWT.

// Não mantém estado no servidor
// O token JWT contém todas as informações necessárias e é validado a cada requisição.