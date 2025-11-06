import { Router, Request, Response } from "express";
import { saludo } from "../classes/models/saludo";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

async function welcomeGenericApi(nombre: string,res: Response): Promise<any>{
    try{
    const saludoObject = new saludo(String(nombre));
    const saludoResult = await saludoObject.welcomeGeneric();
    if(saludoResult.success){
      return res.status(200).json({
        saludo: saludoResult.message,
      });
    }else{
      return res.status(400).json({error: true,errorMessage: saludoResult.message});
    }
  }catch(err){
    return res.status(500).json({ error: true, errorMessage: "Error interno" });
  }
}

router.get("/:nombre", async (req: Request, res: Response) => {
  const { nombre } = req.params;
  welcomeGenericApi(nombre, res);
});

router.get("/", (req: Request, res: Response) => {
  const nombre = req.query.nombre as string | undefined;
  const nombreAux = (nombre=== undefined)?``:nombre;
  welcomeGenericApi(nombreAux, res);
});

router.post("/", async (req: Request, res: Response) => {
  const { nombre } = req.body;
  const nombreAux = (nombre=== undefined || typeof nombre === "boolean")?``:nombre;
  welcomeGenericApi(nombreAux, res);
});

export default router;