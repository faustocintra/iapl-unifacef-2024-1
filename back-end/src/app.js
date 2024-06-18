import dotenv from 'dotenv'
// Carrega as variáveis do arquivo .env dentro
// do objeto global process.env
dotenv.config()

import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index.js";
//import usersRouter from "./routes/users.js";

const app = express();


import cors from 'cors'
app.use(cors({
  //origin: process.env.FRONT_END_URL.split(','),
  oringin: "*",
  credentials: true
}))


app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
//app.use("/users", usersRouter);

// MIDDLEWARE DE AUTENTICAÇÃO
import auth from './middleware/auth.js'
app.use(auth)

/*************************************************
 * ROTAS
 *************************************************/

import usersRouter from './routes/users.js'
import carsRouter from './routes/Cars.js'
app.use('/users', usersRouter)
app.use('/cars', carsRouter)


// app.use(auth)
export default app;
