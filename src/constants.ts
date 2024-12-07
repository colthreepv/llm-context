export const DEFAULT_IGNORE_PATHS = new Set([
  // Project Config Files
  '.dockerignore',
  '.editorconfig',
  '.env.*',
  '.env',

  // Version Control & Build
  '.git',
  '.gitignore',
  '.next',
  'build',
  'dist',
  'node_modules',
  'package-lock.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',

  // License
  'LICENSE',

  // Editor/IDE configs
  '.idea',
  '.vscode',
  '.vs',

  // OS-specific & System Files
  '.DS_Store',
  'Thumbs.db',

  // Logs, Caches, Coverage
  '*.log',
  'coverage',
  'tmp',
  '.cache',

  // Other (Add as needed)
  '.eslintcache',
  'llm-context',
])

export const BINARY_CHECK_BUFFER_SIZE = 4096
export const MAX_JSON_ENTRIES = 4
export const MAX_JSON_ARRAY_ITEMS = 2
