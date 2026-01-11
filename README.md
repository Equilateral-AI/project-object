# Project/Object

**Conceptual continuity for Claude Code.**

Your AI assistant remembers context across sessions. No cloud. No accounts. Just local memory that compounds.

> Named after Frank Zappa's "Project/Object" - his philosophy of treating all creative work as one continuous, interconnected entity. Every album, every song, every performance - part of one grand conceptual continuity.

## Install

```bash
npm install -g @equilateral_ai/project-object
```

## Quick Start

```bash
# Initialize in your project
cd ~/Source/my-project
project-object init

# That's it. Context now persists across Claude Code sessions.
```

## What Happens

1. **You work** - Normal Claude Code session
2. **Session ends** - Key context harvested automatically
3. **Next session** - Context injected at startup
4. **Continuity** - Your AI remembers what matters

## Commands

```bash
project-object init      # Setup hooks for current project
project-object status    # Show current context summary
project-object edit      # Open context file in editor
project-object show      # Display full context
project-object sync      # Sync to other AI tools
project-object clear     # Reset context for this project
project-object help      # Show all commands
```

Short alias: `po` works too (`po init`, `po status`, etc.)

## Cross-Platform Support

Your context works with multiple AI coding tools:

```bash
project-object sync --cursor     # Creates .cursorrules
project-object sync --codex      # Creates AGENTS.md
project-object sync --windsurf   # Creates .windsurfrules
project-object sync --all        # Sync to all platforms
```

See [docs/CROSS_PLATFORM.md](docs/CROSS_PLATFORM.md) for detailed integration guides.

## Slash Commands (Optional)

Manage context without leaving Claude Code:

```
/po-status              # Show context summary
/po-show                # Display full context
/po-add decision ...    # Add a decision
/po-add pattern ...     # Add a pattern
/po-edit                # Edit interactively
/po-sync                # Sync to other tools
```

Install with: `project-object init --with-commands`

See [docs/SLASH_COMMANDS.md](docs/SLASH_COMMANDS.md) for details.

## What Gets Remembered

- Decisions made during sessions
- Patterns and conventions established
- Corrections and clarifications
- Project-specific context you want preserved

## What Doesn't Happen

- **No cloud sync** - Everything stays on your machine
- **No accounts** - No signup, no login, no tracking
- **No telemetry** - We don't know you're using this
- **No magic** - Simple markdown files you can read and edit

## How It Works

Project/Object installs two Claude Code hooks:

- **session-start** - Injects your saved context when Claude Code starts
- **pre-compact** - Harvests important context before session compaction

Context is stored as markdown in `~/.project-object/{project-name}/`:

```
~/.project-object/
├── my-project/
│   └── context.md
├── another-project/
│   └── context.md
└── global/
    └── context.md    # Shared across all projects (optional)
```

## Configuration

Create `.project-object.yml` in your project root (optional):

```yaml
# Scope: 'project' (default) or 'global'
scope: project

# Maximum lines of context to inject
max_context_lines: 200

# Patterns to exclude from harvesting (privacy)
exclude_patterns:
  - password
  - secret
  - api_key
  - token

# Include global context in addition to project context
include_global: true
```

## Manual Curation

Your context files are plain markdown. Edit them anytime:

```bash
project-object edit
# Opens ~/.project-object/{project}/context.md in $EDITOR
```

### Context File Format

```markdown
# Project Context: my-project

## Decisions
- Using PostgreSQL, not DynamoDB
- REST API, not GraphQL
- All dates in UTC

## Patterns
- Handlers use wrapHandler pattern
- Tests colocated with source files
- Error messages include error codes

## Notes
- Main branch is 'main', not 'master'
- CI runs on push to main only
```

## Global Context

For context that applies to all your projects:

```bash
project-object init --global
project-object edit --global
```

Global context is injected alongside project context when `include_global: true`.

## Troubleshooting

### Context not injecting?

```bash
# Check hooks are installed
ls -la .claude/hooks/

# Verify context exists
project-object status
```

### Too much context?

```bash
# Edit and trim manually
project-object edit

# Or set a limit in config
echo "max_context_lines: 100" >> .project-object.yml
```

### Start fresh?

```bash
project-object clear
```

## Philosophy

Session memory should be table stakes for AI coding assistants. This is our contribution to making that happen.

Project/Object is intentionally simple. It solves one problem well: continuity across sessions.

If you need more - team collaboration, automatic pattern detection, analytics, learning that compounds across your organization - we build that too at [mindmeld.dev](https://mindmeld.dev).

## Why "Project/Object"?

Frank Zappa viewed his entire body of work as a single "Project/Object" - one continuous creative entity where themes, characters, and musical phrases recur and interconnect across albums and decades.

Your codebase deserves the same conceptual continuity. Every session builds on the last. Every decision compounds. One continuous project.

## License

MIT - Frank would have wanted it that way.

---

*This was created in Joe's Garage.*

*A gift from [Equilateral AI](https://equilateral.ai).*

*If you need team collaboration, automatic learning, or enterprise features: [mindmeld.dev](https://mindmeld.dev)*
