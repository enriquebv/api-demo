import { createServer } from './server'
import getEnvVariable from './lib/env'
import https from 'https'
import { certificateFor } from 'devcert'

const PORT = getEnvVariable('PORT')
const useSsl = process.argv.includes('--ssl')

async function main() {
  const app = createServer()

  if (!useSsl) {
    app.listen(PORT, () => console.log('Server running on http://localhost:%d', PORT))
    return
  }

  const ssl = await certificateFor('localhost')

  https
    .createServer(
      {
        key: ssl.key,
        cert: ssl.cert,
      },
      createServer()
    )
    .listen(3000, () => {
      console.log('Server running on https://localhost:%d', PORT)
    })
}

main()
