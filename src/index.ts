import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import saludoRouter from "./api/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Hola desde TypeScript en Docker sin Node en Windows!' });
});

app.use("/api/saludo", saludoRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});