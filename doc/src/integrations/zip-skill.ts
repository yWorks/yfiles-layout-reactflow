import { ZipArchive } from 'archiver'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default function zipSkill() {
  return {
    name: 'zip-skill',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outputDir = fileURLToPath(dir)
        const skillDir = path.join(outputDir, 'ai', 'skill')
        const zipPath = path.join(outputDir, 'ai', 'skill.zip')

        await new Promise<void>((resolve, reject) => {
          const output = fs.createWriteStream(zipPath)
          const archive = new ZipArchive({ zlib: { level: 9 } })

          output.on('close', resolve)
          archive.on('error', reject)

          archive.pipe(output)
          archive.glob('**/*', {
            cwd: skillDir,
            dot: true,
            ignore: ['skill.zip']
          })
          archive.finalize()
        })

        await fs.promises.rm(skillDir, { recursive: true, force: true })
        console.log(`Created ${zipPath}`)
      }
    }
  }
}
