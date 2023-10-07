import { once } from 'node:events'
import { createServer } from 'node:http'

import JWT from 'jsonwebtoken'

const JWT_KEY = 'any_key'

const USER_VALID = {
    user: 'valid_user',
    password: 'valid_password'
}

async function loginRoute(request, response) {
    const { user, password } = JSON.parse(await once(request, 'data'))

    if (user !== USER_VALID.user && password !== USER_VALID.password) {
        response.writeHead(401)
        response.end(JSON.stringify({ error: 'user invalid' }))
        return
    }

    const token = JWT.sign({ user, message: 'any_message' }, JWT_KEY)
    response.end(JSON.stringify({ token }))
}

function isHeadersValid(headers) {
    try {
        const auth = headers.authorization.replace(/bearer\s/ig, '')
        JWT.verify(auth, JWT_KEY)
        return true
    } catch (error) {
        return false
    }
}

async function handler(request, response) {
    if (request.url === '/login' && request.method === 'POST') {
        return loginRoute(request, response)
    }

    if (!isHeadersValid(request.headers)) {
        response.writeHead(400)
        response.end(JSON.stringify({ error: 'invalid token' }))
        return
    }

    response.end(JSON.stringify({ result: 'Hey welcome!' }))
}

const app = createServer(handler)
    .listen(3000, () => console.log('listening at 3000'))

export { app }