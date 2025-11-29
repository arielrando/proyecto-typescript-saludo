import dotenv from "dotenv";
dotenv.config();

function isOnlyLetters(value: string): boolean{
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
    return regex.test(value);
}

export const utils = { isOnlyLetters };