export const DEFAULT_IGNORE_PATHS = new Set([
  '.git',
  '.gitignore',
  '.dockerignore',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.env',
  '.env.local',
  '.env.production.local',
  '.env.development.local',
  '.env.test.local',
  'package-lock.json',
  'pnpm-lock.yaml',
  '.editorconfig',
  'LICENSE',
  'yarn.lock',
  'pnpm-workspace.yaml',
])

export const BINARY_CHECK_BUFFER_SIZE = 4096
export const MAX_JSON_ENTRIES = 4
export const MAX_JSON_ARRAY_ITEMS = 2
