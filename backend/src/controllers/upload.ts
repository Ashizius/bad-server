import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import { fileSizeLimits } from '../config'
import * as fs from 'node:fs/promises'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    if (req.file.size < fileSizeLimits.minSize || !req.file || !req.file.path) {
        await fs.unlink(req.file.path)
        return next(new BadRequestError('Файл слишком мал'))
    }
    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        console.log(req.file)
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
