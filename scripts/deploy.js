#!/usr/bin/env node
// Cross-platform deploy script (Windows + Linux + Mac).
// Copies dist/ to all 3 BriefScope plugin variants after build.

import { cpSync, rmSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const frontendDir = resolve(__dirname, '..')
const pluginsDir  = resolve(frontendDir, '..')
const dist        = join(frontendDir, 'dist')

const VARIANTS = [
  'briefscope-cloud',
  'briefscope-local-cpu',
  'briefscope-local-gpu',
]

if (!existsSync(dist)) {
  console.error('Error: dist/ not found. Run "npm run build" first.')
  process.exit(1)
}

for (const variant of VARIANTS) {
  const dest = join(pluginsDir, variant, 'frontend_dist')
  rmSync(dest, { recursive: true, force: true })
  cpSync(dist, dest, { recursive: true })
  console.log(`✓ ${variant}/frontend_dist actualizado`)
}

console.log('\nDeploy completo.')
