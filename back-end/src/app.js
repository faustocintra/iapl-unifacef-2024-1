// Importa o dotenv para carregar variáveis de ambiente do arquivo .env
import dotenv from 'dotenv'
// Carrega as variáveis do arquivo .env dentro do objeto global process.env
dotenv.config()

// Importa módulos do Express e outras bibliotecas necessárias
import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

// Importa rotas
import indexRouter from "./routes/index.js";

const app = express();  // Cria uma instância do Express

// Configura o CORS (Cross-Origin Resource Sharing)
import cors from 'cors'
app.use(cors({
  origin: process.env.FRONT_END_URL.split(','),  // Define os domínios permitidos
  credentials: true  // Permite envio de cookies e headers de autenticação
}))

// Usa middlewares do Express
app.use(logger("dev"));  // requisições HTTP no formato 'dev'
app.use(json());  // Middleware para parsear JSON no body das requisições
app.use(urlencoded({ extended: false }));  // Middleware para parsear URL-encoded data
app.use(cookieParser());  // Middleware para parsear cookies

// Define rotas principais
app.use("/", indexRouter);

// MIDDLEWARE DE AUTENTICAÇÃO
import auth from './middleware/auth.jwt.js'  // Importa middleware de autenticação
app.use(auth)  // Usa o middleware de autenticação

/*************************************************
 * ROTAS
 *************************************************/

// Importa e usa rotas específicas
import usersRouter from './routes/users.js'
app.use('/users', usersRouter)  // Rotas para usuários

import carsRouter from './routes/cars.js'
app.use('/cars', carsRouter)  // Rotas para carros

// Exporta a instância do Express configurada
export default app;
