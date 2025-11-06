import dotenv from "dotenv";
dotenv.config();

function isOnlyLetters(valor: string): boolean{
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
    return regex.test(valor);
}

export const utils = { isOnlyLetters };