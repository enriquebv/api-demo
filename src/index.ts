import { createServer } from './server'
import getEnvVariable from './lib/env'

const PORT = getEnvVariable('PORT')

const app = createServer()

app.listen(PORT, () => console.log('Server started at: http://localhost:%d', PORT))
