import * as fs from 'fs'

const componentsDir = 'src/content/components'
const typesDir = 'src/content/types'
const hooksDir = 'src/content/hooks'
const functionsDir = 'src/content/functions'

export function cleanup() {
  if (fs.existsSync(componentsDir)) {
    fs.rmSync(componentsDir, { recursive: true, force: true })
  }
  fs.mkdirSync(componentsDir)

  if (fs.existsSync(typesDir)) {
    fs.rmSync(typesDir, { recursive: true, force: true })
  }
  fs.mkdirSync(typesDir)

  if (fs.existsSync(hooksDir)) {
    fs.rmSync(hooksDir, { recursive: true, force: true })
  }
  fs.mkdirSync(hooksDir)

  if (fs.existsSync(functionsDir)) {
    fs.rmSync(functionsDir, { recursive: true, force: true })
  }
  fs.mkdirSync(functionsDir)
}
