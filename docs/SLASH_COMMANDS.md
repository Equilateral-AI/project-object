# Slash Commands

Project/Object includes optional Claude Code slash commands for managing context without leaving your session.

## Available Commands

| Command | Description |
|---------|-------------|
| `/po-init` | Initialize Project/Object for current project |
| `/po-status` | Show context summary |
| `/po-show` | Display full context |
| `/po-edit` | Edit context interactively |
| `/po-add` | Add item to context |
| `/po-sync` | Sync to other AI tools |

## Installation

### Automatic (during init)

```bash
project-object init --with-commands
```

### Manual

Copy commands to your project:

```bash
cp -r node_modules/@equilateral/project-object/claude-commands/* .claude/commands/
```

Or copy globally:

```bash
mkdir -p ~/.claude/commands
cp -r node_modules/@equilateral/project-object/claude-commands/* ~/.claude/commands/
```

## Usage Examples

### Check status
```
/po-status
```

### View full context
```
/po-show
```

### Add a decision
```
/po-add decision Using PostgreSQL instead of DynamoDB
```

### Add a pattern
```
/po-add pattern All API handlers use wrapHandler
```

### Edit context interactively
```
/po-edit
```
Then tell Claude what to add, remove, or change.

### Sync to Cursor
```
/po-sync cursor
```

## Command Details

### /po-add

Add items to specific sections:

```
/po-add decision <text>    → ## Decisions
/po-add pattern <text>     → ## Patterns
/po-add correction <text>  → ## Corrections
/po-add note <text>        → ## Notes
```

### /po-edit

Interactive editing. Claude will:
1. Show current context
2. Ask what you want to change
3. Update the file

### /po-sync

Sync to other platforms:

```
/po-sync           → Auto-detect platforms
/po-sync cursor    → .cursorrules
/po-sync codex     → AGENTS.md
/po-sync windsurf  → .windsurfrules
/po-sync all       → All platforms
```

## Why Slash Commands?

- **Stay in flow**: Manage context without switching to terminal
- **Interactive editing**: Let Claude help curate your context
- **Quick additions**: Add decisions/patterns as you make them

## Without Slash Commands

You can always use the CLI directly:

```bash
project-object status
project-object show
project-object edit
project-object sync
```

Or run commands via Claude:
```
Run `project-object status` and show me the output
```
