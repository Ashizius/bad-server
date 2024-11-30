import { DoubleCsrfConfigOptions } from 'csrf-csrf'
import { CookieOptions } from 'express'
import ms from 'ms'

export const { PORT = '3000' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const { JWT_SECRET = 'JWT_SECRET' } = process.env
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}

export const corsOptions = {
    origin: 'http://localhost',
    credentials: true,
    //optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const CSRF_SECRET = process.env.CSRF_SECRET

if (!CSRF_SECRET) {
    console.log('DANGER! no secret provided!', process.env)
}

export const doubleCsrfOptions:DoubleCsrfConfigOptions = {
    getSecret: () => process.env.CSRF_SECRET || '___Secret___',
    cookieName: process.env.CSRF_COOKIE_NAME || '__Host-larek.x-csrf-token',
    cookieOptions: {
        sameSite: 'strict',
        path: '/',
        secure: process.env.CSRF_COOKIE_IS_SECURE
            ? process.env.CSRF_COOKIE_IS_SECURE.toUpperCase() === 'TRUE'
            : true,
    },
}

export const isRegenerateCsrfToken: boolean = true
