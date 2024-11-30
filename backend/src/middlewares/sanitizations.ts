import { NextFunction, Request, Response } from 'express'
import { sanitizeStringFull, sanitizeStringPartial } from '../utils/sanitizeString';
// import escapeRegExp from '../utils/escapeRegExp';

interface SomeObject {
  [index: string]: any
}

const sanitizeObject = (obj:SomeObject,specialKeys:string[]) => {
    let sanitizedObject = {...obj};
Object.keys(sanitizedObject).forEach(key=>{
    if (key in sanitizedObject){
      if (typeof sanitizedObject[key]==='object') {
        sanitizedObject=sanitizeObject(sanitizedObject[key],specialKeys);
      }
      else if (typeof sanitizedObject[key]==='string') {
        if (specialKeys.indexOf(key)>=0){
            sanitizedObject[key]=sanitizeStringPartial(sanitizedObject[key]);
          // obj[key]=escapeRegExp(obj[key]);
        }
        else{
            sanitizedObject[key]=sanitizeStringFull(sanitizedObject[key]);
          // obj[key]=escapeRegExp(obj[key]);
        }
      }
    }
  })
  return sanitizedObject
}

export default function sanitizeBody (specialKeys?:string[]){ 
  return (req: Request, _: Response, next: NextFunction) => {
    req.body = sanitizeObject(req.body, specialKeys||[]);
      console.log(req.body);
    return next()
  }
}
