import { NextFunction, Request, Response } from 'express'
import { sanitizeStringFull, sanitizeStringPartial } from '../utils/sanitizeString';
import escapeRegExp from '../utils/escapeRegExp';

interface SomeObject {
  [index: string]: any
}

const sanitizeObject = (obj:SomeObject,specialKeys:string[]) => {
Object.keys(obj).forEach(key=>{
    if (key in obj){
      if (typeof obj[key]==='object') {
        sanitizeObject(obj[key],specialKeys);
      }
      else if (typeof obj[key]==='string') {
        if (specialKeys.indexOf(key)>=0){
          obj[key]=sanitizeStringPartial(obj[key]);
          //obj[key]=escapeRegExp(obj[key]);
        }
        else{
          obj[key]=sanitizeStringFull(obj[key]);
          //obj[key]=escapeRegExp(obj[key]);
        }
      }
    }
  })
}

export default function sanitizeBody (specialKeys?:string[]){ 
  return (req: Request, _: Response, next: NextFunction) => {
      sanitizeObject(req.body, specialKeys||[]);
      console.log(req.body);
    return next()
  }
}
