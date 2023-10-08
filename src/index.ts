import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT

const app = express()
app.disable('x-powered-by')

app.get('/', (_, res) => res.send({ ok: true }))

app.listen(PORT, () => console.log('Server started at: http://localhost:%d', PORT))
