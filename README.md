# llm-context

A CLI tool that builds context files from your project for Large Language Models (LLMs). It traverses directories, collecting file structures and contents into a single `.txt` file optimized for LLM context.

## Installation

```bash
npm install -g llm-context
```

For development:
```bash
git clone https://github.com/colthreepv/llm-context
cd llm-context
pnpm install
# Build and link globally so you can invoke 'llm-context' anywhere
pnpm build
pnpm link --global
```

## Usage

Basic syntax:
```bash
llm-context <directory> <suffix> [options]
```

Example:
```bash
llm-context ./ context
```
This creates `llm-context.context.txt` containing:
- A `<tree>` block showing your file structure with token counts
- `<file>` blocks containing each file's contents

### File Ignoring System

Use `-i` or `--ignore` to exclude files/directories:
```bash
llm-context ./src output -i "*.test.ts" -i cache -i docs
```

The ignore system uses a "greedy" pattern matching approach:
- Patterns are converted to regular expressions
- `*` matches any sequence of characters
- `?` matches any single character
- Matches are case-sensitive
- A match anywhere in the path excludes the file/directory

Examples:
- `*.log` → matches `error.log`, `debug.log`
- `test/*` → matches anything in the `test` directory
- `.env.*` → matches `.env.local`, `.env.production`

Default ignored paths include:
- VCS: `.git`, `.gitignore`
- Dependencies: `node_modules`, `*lock.json`, `*.yaml`
- Build outputs: `dist`, `build`, `.next`
- Configs: `.env*`, `.vscode`, `.idea`
- System files: `.DS_Store`, `Thumbs.db`
- Temporary: `coverage`, `tmp`, `.cache`

### Output Structure

The generated file contains:
1. A `<tree>` block with directory structure and token counts:
```
<tree>
project (1234)
  ├── src (789)
  │   ├── index.ts (234)
  │   └── utils.ts (555)
  └── package.json (45)
</tree>
```

2. File contents in `<file>` blocks:
```
<file name="src/index.ts">
// File contents here
</file>
```

### Token Estimation

The tool estimates tokens using a character-to-token ratio of ~3.62 characters per token. This is an approximation to help you stay within LLM context limits.

Large JSON files are automatically truncated to maintain reasonable context sizes:
- Objects: Limited to first 4 key-value pairs
- Arrays: Limited to first 2 items
