import { openmeteo } from "../utils/openmeteo";
import { utils } from "../utils/utils";
import logger from "../utils/logger";
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

    public async welcomeGeneric(): Promise<welcomeGenericResult>{
        try{
            if (!this.nombre) {
                logger.error(`No ingreso el nombre`);
                return {success:false,message:`Debe ingresar el nombre!`};
            }

            if(!utils.isOnlyLetters(this.nombre)){
                logger.error(`No se ingreso solo letras: ${this.nombre}`);
                return {success:false,message:`Debe ingresar solo letras!`};
            }
            const openmeteoObject = new openmeteo(Number(process.env.LATITUDE), Number(process.env.LONGITUDE));
            const SunHours = await openmeteoObject.getSunHours();
            const saludoTexto = (() => {
                switch (SunHours.welcomeType) {
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