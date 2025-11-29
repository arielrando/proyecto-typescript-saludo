import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import saludoRouter from "./api/index";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Proyecto iniciado!' });
});

app.use("/api/saludo", saludoRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});