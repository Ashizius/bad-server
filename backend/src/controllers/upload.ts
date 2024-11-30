import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import { fileSizeLimits } from '../config'
import * as fs from 'node:fs/promises'
import fsSync from 'fs'
import sanitizeHtml from 'sanitize-html'

const magicHex = {
    png: ['89504e47'],
    jpg: ['ffd8ffe0', 'ffd8ffee', 'ffd8ffee1'],
    jpeg: [''],
    gif: ['47494638'],
    'svg+xml': (signature: string) => signature.toLowerCase() === '<svg',
}

magicHex['jpeg'] = magicHex['jpg']

const readPartialFile = async (
    filePath: string,
    {
        highWaterMark = 4,
        encoding = 'hex',
    }: { highWaterMark: number; encoding: BufferEncoding }
) => {
    /*let resolve: (value:string)=>void;
    let reject: (err:Error)=>void;*/
    const promise = new Promise<string>((res, rej) => {
        try {
            const readStream = fsSync.createReadStream(filePath, {
                highWaterMark,
                encoding,
            })
            readStream.on('data', (chunk: string) => {
                res(chunk)
                readStream.close()
            })
        } catch (err: any) {
            rej(err)
        }
    })
    return promise
}

const checkSignature = async ({
    //signature,
    filetype,
    filePath,
}: {
    //signature: string
    filetype: keyof typeof magicHex
    filePath: string
}) => {
    const check = magicHex[filetype]
    if (Array.isArray(check)) {
        const signature = await readPartialFile(filePath, {
            highWaterMark: 4,
            encoding: 'hex',
        })
        console.log('@@@@@@@@@@@@@@@@@@')
        console.log(signature)
        console.log(check)
        //const signature = buffer.toString('hex', 0, 4)
        return check.includes(signature)
    } else {
        const signature = await readPartialFile(filePath, {
            highWaterMark: 4,
            encoding: 'utf-8',
        })
        console.log('@@@@@@@@@@@@@@@@@@')
        console.log(signature)
        console.log(check)
        return check(signature)
    }
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!req.file', req.file)
    //console.log('req.headers', req.)
    //console.log('@@@@@@@@@@@@@@@@@req.body', req.body)
    const filetype = req.file.mimetype
        ?.split('/')[1]
        .toLowerCase() as keyof typeof magicHex

    if (
        (req.file.size < fileSizeLimits.minSize ||
            !req.file ||
            !req.file.path) &&
        filetype !== 'svg+xml'
    ) {
        await fs.unlink(req.file.path)
        return next(new BadRequestError('Файл слишком мал'))
    }

    const filePath = req.file.path
    const isImage = await checkSignature({ filetype, filePath })
    if (!isImage) {
        await fs.unlink(filePath)
        return next(new BadRequestError('файл не соответствует типу'))
    }
    if (filetype === 'svg+xml') {
        let svg = await fs.readFile(filePath, { encoding: 'utf-8' })
        svg = sanitizeHtml(svg, {
            allowedTags: [
                'svg',
                'g',
                'defs',
                'linearGradient',
                'stop',
                'circle',
            ],
            allowedAttributes: false,
            parser: {
                lowerCaseTags: false,
                lowerCaseAttributeNames: false,
            },
        })
        fs.writeFile(filePath, svg, { encoding: 'utf-8' })
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
