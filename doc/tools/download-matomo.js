import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const destPath = path.join(__dirname, '../src/scripts/matomo.js')

https.get('https://trk.yworks.com/js/piwik.js', response => {
  if (response.statusCode !== 200) {
    console.error('Downloading matomo.js failed with status: ' + response.statusCode)
    response.pipe(process.stderr)
    response.on('end', () => {
      process.exit(1)
    })
  } else {
    response.pipe(fs.createWriteStream(destPath))
  }
})
