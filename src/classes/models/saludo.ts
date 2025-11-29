import { openmeteo } from "../utils/openmeteo";
import logger from "../utils/logger";
import { Response,Request } from "express";
import dotenv from "dotenv";
dotenv.config();

interface welcomeGenericResult {
  success: boolean;
  message: string;
}

export class saludo{
    private nombre: string;

    constructor(nombre: string){
        this.nombre = nombre;
    }

    public async welcomeGeneric(res: Response, req: Request): Promise<welcomeGenericResult>{
        try{
            let nextSunTime = undefined;
            let welcomeType = 1;
            const formatter = new Intl.DateTimeFormat("en-CA", {timeZone: process.env.TIMEZONE, dateStyle: "short", timeStyle: "medium", hour12: false}).format(new Date());
            const now = new Date(formatter);
            const nowAux = now.getTime();
            try {
                nextSunTime = JSON.parse(req.cookies.nextSunTime);
            } catch {
                nextSunTime = undefined;
            }
            
            if (typeof nextSunTime !== 'undefined' && nextSunTime !== null && nowAux < nextSunTime.nextSunTime){
                welcomeType = nextSunTime.welcomeType;
            }else{
                const openmeteoObject = new openmeteo(Number(process.env.LATITUDE), Number(process.env.LONGITUDE));
                const SunHours = await openmeteoObject.getSunHours(res);
                welcomeType = SunHours.welcomeType;
            }

            const saludoTexto = (() => {
                switch (welcomeType) {
                    case 1:
                    default:
                    return "buenos días";
                    case 2:
                    return "buenas tardes";
                    case 3:
                    return "buenas noches";
                }
            })();
            return {success:true,message:`Hola ${this.nombre}, ${saludoTexto}`};
        }catch(err){
            logger.error(`Ocurrio un error, salgo por el catch ${String(err)}`);
            throw new Error();
        }
    }
}