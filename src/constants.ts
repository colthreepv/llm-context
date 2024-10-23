export const DEFAULT_IGNORE_PATHS = new Set([
  '.dockerignore',
  '.editorconfig',
  '.env.development.local',
  '.env.local',
  '.env.production.local',
  '.env.test.local',
  '.env',
  '.git',
  '.gitignore',
  '.next',
  'build',
  'dist',
  'LICENSE',
  'node_modules',
  'package-lock.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',
])

export const BINARY_CHECK_BUFFER_SIZE = 4096
export const MAX_JSON_ENTRIES = 4
export const MAX_JSON_ARRAY_ITEMS = 2
