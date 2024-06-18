import jwt from "jsonwebtoken";

export default function (req, res, next) {
  // Definindo rotas que não necessitam de autenticação
  const bypassRoutes = [
    { url: "/users/login", method: "POST" },
    { url: "/users", method: "POST" },
  ];

  // Verifica se a rota atual está nas exceções de bypassRoutes.
  // Se estiver, passa para o próximo middleware sem verificar a autenticação
  for (let route of bypassRoutes) {
    if (route.url === req.url && route.method === req.method) {
      console.log(
        `Rota ${route.url}, método ${route.method} não autenticados por exceção`
      );
      next();
      return;
    }
  }

  // Para todas as outras rotas, é necessário que o token esteja
  // presente em um cookie ou no cabeçalho Authorization

  let token = null;

  console.log({ COOKIE: req.cookies[process.env.AUTH_COOKIE_NAME] });

  // 1. PROCURA O TOKEN EM UM COOKIE
  token = req.cookies[process.env.AUTH_COOKIE_NAME];

  // 2. SE O TOKEN NÃO FOR ENCONTRADO NO COOKIE, PROCURA NO HEADER DE AUTORIZAÇÃO
  if (!token) {
    const authHeader = req.headers["authorization"];

    // Se o cabeçalho Authorization não existir, retorna HTTP 403: Forbidden
    if (!authHeader) {
      console.error(
        "ERRO: não autenticado por falta de cookie ou cabeçalho de autorização"
      );
      return res.status(403).end();
    }

    // O cabeçalho Authorization é enviado como uma string "Bearer: XXXX"
    // onde XXXX é o token. Precisamos extrair o token separando a string
    const [, _token] = authHeader.split(" ");

    token = _token;
  }

  // Valida o token
  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    // Se o token for inválido ou expirado, retorna HTTP 403: Forbidden
    if (error) {
      console.error("ERRO: token inválido ou expirado");
      return res.status(403).end();
    }

    /*
      Se chegamos até aqui, o token está válido e temos as informações
      do usuário autenticado no parâmetro 'user'. Vamos guardá-lo no 'req'
      para futura utilização.
    */
    req.authUser = user;

    // Continua para a próxima rota
    next();
  });
}
