import { Router, Request, Response, NextFunction  } from "express";
import { saludo } from "../classes/models/saludo";
import { utils } from "../classes/utils/utils";
import logger from "../classes/utils/logger";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

function validarNombre(req: Request, res: Response, next: NextFunction): void {
  const nombre =
    req.params.nombre ??
    req.query.nombre ??
    req.body.nombre;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    logger.error(`No ingreso el nombre`);
    res.status(400).json({
      error: true,
      errorMessage: "No ingreso su nombre!",
    });
    return;
  }

  if(!utils.isOnlyLetters(nombre)){
    logger.error(`No se ingreso solo letras: ${nombre}`);
    res.status(400).json({
      error: true,
      errorMessage: "El nombre solo puede contener letras!",
    });
    return;
  }

  (req as any).nombreValidado = nombre;

  next();
}

async function welcomeGenericApi(res: Response, req: Request): Promise<any>{
    try{
      const nombre = (req as any).nombreValidado;
      const saludoObject = new saludo(String(nombre));
      const saludoResult = await saludoObject.welcomeGeneric(res, req);
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

router.get("/:nombre", validarNombre, async (req: Request, res: Response) => {welcomeGenericApi(res,req);});

router.get("/", validarNombre, (req: Request, res: Response) => {welcomeGenericApi(res,req);});

router.post("/", validarNombre, async (req: Request, res: Response) => {welcomeGenericApi( res,req);});

export default router;