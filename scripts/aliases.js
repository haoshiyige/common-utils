// @ts-check
// these aliases are shared between vitest and rollup
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resolveEntryForPkg = p => path.resolve(fileURLToPath(import.meta.url), `../../packages/${p}/src/index.ts`)

const dirs = readdirSync(new URL('../packages', import.meta.url))

const entries = {
  // vue: resolveEntryForPkg('vue'),
  '@nin/common-core': resolveEntryForPkg('common-core'),
  '@nin/storage-utils': resolveEntryForPkg('storage-utils')
  // '@vue/compat': resolveEntryForPkg('vue-compat')
}

const nonSrcPackages = ['sfc-playground', 'template-explorer', 'dts-test']

for (const dir of dirs) {
  const key = `@nin/${dir}`
  if (
    dir !== 'nin' &&
    !nonSrcPackages.includes(dir) &&
    !(key in entries) &&
    statSync(new URL(`../packages/${dir}`, import.meta.url)).isDirectory()
  ) {
    entries[key] = resolveEntryForPkg(dir)
  }
}

export { entries }
