# Project/Object Setup Guide

## Prerequisites

- Node.js 18+
- Claude Code CLI installed

## Installation

### Global Install (Recommended)

```bash
npm install -g @equilateral/project-object
```

### Per-Project Install

```bash
npm install --save-dev @equilateral/project-object
```

## Setup

### Automatic (Recommended)

```bash
cd your-project
project-object init
```

This creates:
- `.claude/hooks/session-start.js` - Injects context on session start
- `.claude/hooks/pre-compact.js` - Harvests context before compaction
- `~/.project-object/{project}/context.md` - Your context file

### Manual

1. Create hooks directory:
   ```bash
   mkdir -p .claude/hooks
   ```

2. Copy hook templates from `node_modules/@equilateral/project-object/src/hooks/`

3. Initialize context:
   ```bash
   project-object init
   ```

## Configuration

Create `.project-object.yml` in your project root (optional):

```yaml
# Context scope
scope: project  # or 'global'

# Maximum lines to inject (prevents bloat)
max_context_lines: 200

# Privacy: patterns to exclude from harvesting
exclude_patterns:
  - password
  - secret
  - api_key
  - token
  - credential

# Include global context with project context
include_global: true
```

## Verifying Setup

```bash
# Check status
project-object status

# View context
project-object show

# Edit context manually
project-object edit
```

## How It Works

### Session Start Hook

When Claude Code starts, the session-start hook:
1. Loads your context from `~/.project-object/{project}/context.md`
2. Optionally loads global context from `~/.project-object/global/context.md`
3. Injects combined context as `<project-object-context>` block

### Pre-Compact Hook

Before Claude Code compacts a conversation, the pre-compact hook:
1. Scans the transcript for decisions, patterns, corrections, and notes
2. Merges new findings with existing context
3. Saves updated context to disk

### Context Storage

All context is stored as markdown in `~/.project-object/`:

```
~/.project-object/
├── my-project/
│   └── context.md
├── another-project/
│   └── context.md
└── global/
    └── context.md
```

## Troubleshooting

### Context not injecting?

1. Verify hooks exist:
   ```bash
   ls -la .claude/hooks/
   ```

2. Check context exists:
   ```bash
   project-object status
   ```

3. Verify Claude Code reads hooks (check Claude Code docs)

### Too much context?

Set a limit in `.project-object.yml`:
```yaml
max_context_lines: 100
```

Or manually trim:
```bash
project-object edit
```

### Want to start fresh?

```bash
project-object clear
project-object init
```

## Uninstalling

1. Remove hooks:
   ```bash
   rm -rf .claude/hooks/session-start.js .claude/hooks/pre-compact.js
   ```

2. Optionally remove context:
   ```bash
   rm -rf ~/.project-object/{your-project}
   ```

3. Uninstall package:
   ```bash
   npm uninstall -g @equilateral/project-object
   ```
