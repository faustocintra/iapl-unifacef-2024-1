import { Router } from "express";
import controller from "../controllers/users.js";

const router = Router();

// resolvi deixar a resposta aqui para não ter que repetila tanto dentro do gerenciador de sessão quanto no estrutura jwt.
// RESPOSTA ABAIXO:

// A autenticação por Token JWT usa tokens assinados que ficam no navegador do usuário. Esses tokens são usados em cada pedido para verificar quem está acessando, sendo útil para sistemas que precisam escalar facilmente. Já a autenticação por sessão usa um identificador guardado no navegador, que o servidor usa para conferir se a sessão é válida. Isso dá mais controle sobre quem está acessando, mas pode ser mais difícil de escalar sem complicar o servidor. A escolha depende de como você precisa proteger e expandir seu sistema.

router.get("/me", controller.me);
router.post("/logout", controller.logout);
router.post("/", controller.create);
router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.post("/login", controller.login);

export default router;
