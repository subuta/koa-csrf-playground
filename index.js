import Koa from 'koa'

import Csrf from 'koa-csrf'
import session from 'koa-session'

import koaBody from 'koa-body'
import logger from 'koa-logger'
import Router from 'koa-router'
import serve from 'koa-static'

import cors from '@koa/cors'

import { source } from 'common-tags'

import path from 'path'

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

const app = new Koa()

app.keys = ['secret']

app.use(serve(path.resolve(__dirname, './public')))

app.use(cors())

app.use(logger())
app.use(koaBody())

// Enable CSRF protection.
app.use(session(app))
app.use(new Csrf())

const router = new Router()

router.get('/', (ctx) => {
  // You should always add XSS sanitization for "template literal + html" thing in Production env.
  // language=html
  ctx.body = source`
    <!doctype html>
    <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport'
                  content='width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'>
            <meta http-equiv='X-UA-Compatible' content='ie=edge'>
            <title>Document</title>
        </head>
        <body>
            <h1>SSR Example</h1>
            
            <header style='margin: 1rem 0;'>
              <a href='/spa.html'>SPA version</a>
            </header>
        
            <form action='/register' method='POST'>
                <input type='hidden' name='_csrf' value='${ctx.csrf}' />
                <!-- We won't use these fields, but for realistic example :) -->
                <input type='email' name='email' placeholder='Email' />
                <input type='password' name='password' placeholder='Password' />
                <button type='submit'>Register</button>
            </form>
        </body>
    </html>
  `
})

// API to ensure CSRF token set.
router.get('/api/ensure_csrf_token', (ctx) => {
  ctx.cookies.set('some-cookie-value', 'hoge', {
    // Treat as session cookie.
    // Must force HTTPS at production
    secure: !dev,
    // Set httpOnly=false for enable reading cookie at client-side as deliberately.
    httpOnly: false
  })

  // SEE: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
  ctx.cookies.set('XSRF-TOKEN', ctx.csrf, {
    // Treat as session cookie.
    // Must force HTTPS at production
    secure: !dev,
    // Set httpOnly=false for enable reading cookie at client-side as deliberately.
    httpOnly: false
  })
  // Won't use body.
  ctx.body = ''
})

router.get('/register', (ctx) => {
  ctx.redirect('/')
})

router.post('/register', (ctx) => {
  console.log('some-cookie-value', JSON.stringify(ctx.cookies.get('some-cookie-value'), null, 2))
  console.log('body = ', JSON.stringify(ctx.request.body, null, 2))
  // Your browser will show this message if CSRF check passed.
  ctx.body = 'success!'
})

app.use(router.routes())
  .use(router.allowedMethods())

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`)
})
