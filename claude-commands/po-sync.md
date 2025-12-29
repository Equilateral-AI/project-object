# /po-sync

Sync Project/Object context to other AI coding tools.

## Usage

```
/po-sync [platform]
```

Examples:
- `/po-sync` - Sync to all detected platforms
- `/po-sync cursor` - Sync to Cursor (.cursorrules)
- `/po-sync codex` - Sync to Codex CLI (AGENTS.md)
- `/po-sync windsurf` - Sync to Windsurf (.windsurfrules)
- `/po-sync all` - Sync to all platforms

## Instructions

Run the appropriate command:

```bash
# Auto-detect
project-object sync

# Specific platform
project-object sync --cursor
project-object sync --codex
project-object sync --windsurf
project-object sync --all
```

Report which files were created/updated.
