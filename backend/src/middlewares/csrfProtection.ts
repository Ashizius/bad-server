//npm i csrf-csrf
import { doubleCsrfOptions } from "../config";
import { doubleCsrf } from "csrf-csrf";

const {doubleCsrfProtection:csrfProtection, generateToken} = doubleCsrf(doubleCsrfOptions);

export {csrfProtection, generateToken}