# Cross-Platform Usage

Project/Object stores context in `~/.project-object/` as plain markdown. This means your context is portable across any AI coding tool that supports custom prompts or rules.

## Supported Platforms

| Platform | Integration Method | Auto-Inject | Manual |
|----------|-------------------|-------------|--------|
| Claude Code | Hooks | Yes | - |
| Cursor | .cursorrules | Partial | Yes |
| Codex CLI | AGENTS.md | Partial | Yes |
| Continue.dev | config.json | Partial | Yes |
| Cody | Custom instructions | No | Yes |
| Windsurf | Rules | Partial | Yes |
| GitHub Copilot | - | No | Yes |

## Claude Code (Native)

```bash
project-object init
# Hooks installed automatically
```

## Cursor

Cursor reads `.cursorrules` files in your project root.

### Option 1: Symlink (Recommended)

```bash
# Create symlink to your context
cd your-project
ln -s ~/.project-object/$(basename $PWD)/context.md .cursorrules
```

### Option 2: Include Directive

Create `.cursorrules`:
```
# Project Context
@import ~/.project-object/{project-name}/context.md

# Additional Cursor-specific rules below
```

### Option 3: Manual Copy Script

Add to your shell profile (`.zshrc` / `.bashrc`):
```bash
# Sync Project/Object to Cursor on cd
function cd() {
  builtin cd "$@"
  if [ -f ~/.project-object/$(basename $PWD)/context.md ]; then
    cp ~/.project-object/$(basename $PWD)/context.md .cursorrules 2>/dev/null
  fi
}
```

## Codex CLI

Codex CLI reads `AGENTS.md` files.

### Option 1: Symlink

```bash
cd your-project
ln -s ~/.project-object/$(basename $PWD)/context.md AGENTS.md
```

### Option 2: Include in AGENTS.md

```markdown
# Agent Instructions

## Project Context
<!-- Include Project/Object context -->
{{INCLUDE:~/.project-object/{project}/context.md}}

## Additional Instructions
...
```

### Option 3: Environment Variable

```bash
export CODEX_SYSTEM_PROMPT="$(cat ~/.project-object/$(basename $PWD)/context.md)"
```

## Continue.dev

Edit `~/.continue/config.json`:

```json
{
  "systemMessage": "",
  "customCommands": [
    {
      "name": "context",
      "description": "Load project context",
      "prompt": "{{file:~/.project-object/{project}/context.md}}"
    }
  ]
}
```

Or use a pre-prompt script in your Continue config.

## Cody (Sourcegraph)

Cody doesn't support file includes, but you can:

1. **Manual paste**: Copy context at session start
2. **Custom command**: Create a snippet that outputs context

```bash
# Add to shell
alias cody-context="cat ~/.project-object/\$(basename \$PWD)/context.md | pbcopy && echo 'Context copied to clipboard'"
```

## Windsurf

Windsurf reads `.windsurfrules` files.

```bash
cd your-project
ln -s ~/.project-object/$(basename $PWD)/context.md .windsurfrules
```

## GitHub Copilot

Copilot doesn't support custom system prompts, but you can:

1. Keep a `CONTEXT.md` in your repo root
2. Reference it in comments: `// See CONTEXT.md for project conventions`
3. Copilot will pick up patterns from the file

## Universal Sync Script

Add this to your shell profile for automatic syncing:

```bash
# ~/.zshrc or ~/.bashrc

# Project/Object cross-platform sync
po-sync() {
  local project=$(basename $PWD)
  local context_file=~/.project-object/$project/context.md

  if [ ! -f "$context_file" ]; then
    echo "No Project/Object context for $project"
    return 1
  fi

  # Cursor
  if [ -f .cursorrules ] || [ -d .cursor ]; then
    cp "$context_file" .cursorrules
    echo "✓ Synced to .cursorrules"
  fi

  # Codex
  if [ -f AGENTS.md ]; then
    cp "$context_file" AGENTS.md
    echo "✓ Synced to AGENTS.md"
  fi

  # Windsurf
  if [ -f .windsurfrules ]; then
    cp "$context_file" .windsurfrules
    echo "✓ Synced to .windsurfrules"
  fi

  echo "Context synced for $project"
}

# Auto-sync on directory change (optional)
# Uncomment to enable:
# function cd() {
#   builtin cd "$@"
#   po-sync 2>/dev/null
# }
```

## Cloud Sync (Optional)

If you want to sync context across machines, use any file sync service:

### Dropbox/iCloud/OneDrive

```bash
# Move storage to synced location
mv ~/.project-object ~/Dropbox/project-object
ln -s ~/Dropbox/project-object ~/.project-object
```

### Git (Private Repo)

```bash
cd ~/.project-object
git init
git remote add origin git@github.com:yourusername/my-context.git
git add -A && git commit -m "Sync context"
git push
```

Then on other machines:
```bash
git clone git@github.com:yourusername/my-context.git ~/.project-object
```

## CLI Helper Command

Project/Object includes a sync command:

```bash
# Sync to all detected platforms in current directory
project-object sync

# Sync specific platform
project-object sync --cursor
project-object sync --codex
project-object sync --windsurf
```

## Best Practices

1. **One source of truth**: Always edit via `project-object edit`, not the platform-specific files
2. **Use symlinks when possible**: Avoids sync issues
3. **Don't commit platform files**: Add `.cursorrules`, `AGENTS.md` to `.gitignore` if they're symlinks
4. **Global context**: Use `project-object init --global` for context that applies everywhere

## Limitations

- **No auto-harvest on other platforms**: Only Claude Code hooks harvest automatically
- **Manual sync required**: Run `po-sync` or `project-object sync` after editing
- **Platform-specific features**: Some platforms have features Project/Object doesn't use

For full automatic learning and cross-platform sync, see [mindmeld.dev](https://mindmeld.dev).
