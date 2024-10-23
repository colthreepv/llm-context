# llm-context
A CLI tool to build context files to attach to Large Language Models (LLMs).

`llm-context` is a command-line utility designed to process directories of files and generate context files suitable for consumption by LLMs.

## Usage

```bash
llm-context <directory> <suffix> [options]
```

- `<directory>`: The directory to process.
- `<suffix>`: The output file suffix.

### Options

- `-i, --ignore <paths...>`: Additional paths to ignore during processing.

### Examples

**Process the current directory and generate a context file:**

```bash
llm-context ./ output
```

**Process a specific directory while ignoring additional paths:**

```bash
llm-context ./my-project output -i dist coverage .env
```

## Output

After running the command, you will receive:

- A context file named `llm-context.<suffix>.txt` containing:
  - A tree representation of your file structure enclosed in `<tree>` tags.
  - The contents of your files enclosed in tokenized delimiters.
### Sample Output

```bash
Context file created at: llm-context.output.txt

Report:
<tree>
my-project
├── src
│   ├── index.ts
│   └── utils.ts
├── package.json
└── README.md
</tree>

Estimated Tokens: 1234
```

### Ignoring Additional Paths

You can ignore additional paths using the `-i` or `--ignore` option:

```bash
llm-context ./ output -i logs temp data.json
```
