# Project/Object

**Conceptual continuity for Claude Code.**

Session memory + coding standards for AI coding sessions. No cloud. No accounts. Just local context that compounds.

> Named after Frank Zappa's "Project/Object" - his philosophy of treating all creative work as one continuous, interconnected entity. Every album, every song, every performance - part of one grand conceptual continuity.

## Install

```bash
npm install -g @equilateral_ai/project-object
```

## Quick Start

```bash
cd ~/Source/my-project
project-object init

# That's it. Context + standards now inject into every Claude Code session.
```

`init` does three things:
1. Creates your session memory store
2. Pulls coding standards from OpenCore + Community repositories
3. Registers Claude Code hooks in `.claude/settings.json`

## What You Get

**Session Memory** — Context persists across Claude Code sessions. Decisions, patterns, and corrections compound over time.

**Coding Standards** — 67+ open-source standards (800+ rules) injected into every AI coding session. Your AI follows your team's rules from the first prompt.

## Commands

```bash
project-object init      # Setup hooks + pull standards
project-object status    # Show context and standards summary
project-object update    # Pull latest standards from upstream
project-object show      # Display full context
project-object edit      # Open context file in editor
project-object sync      # Sync to other AI tools
project-object clear     # Reset context for this project
project-object help      # Show all commands
```

Short alias: `po` works too (`po init`, `po status`, etc.)

## Standards — Three-Source Model

Standards come from three sources, merged into `.standards/` in your project:

```
.standards/
├── opencore/                 ← Core coding standards (pulled automatically)
│   ├── development-principles.yaml
│   ├── serverless/
│   └── well-architected/
├── community/                ← Community-contributed standards (pulled automatically)
│   ├── tdd-methodology.yaml
│   └── ...
└── local/                    ← Your own project-specific standards
    └── my-team-rules.yaml
```

| Source | What | Managed By |
|--------|------|------------|
| **OpenCore** | Core development principles, well-architected patterns | Equilateral AI |
| **Community** | Community-contributed patterns (TDD, clean code, etc.) | Open PRs |
| **Local** | Your project-specific rules | You |

All three sources are injected into AI sessions as a compact rule set.

### Curating Standards

Standards are just YAML files. Curate by working with files directly:

**Remove a standard you don't need:**
```bash
rm .standards/community/some-standard.yaml
```

**Add your own standard:**
```bash
# Create a YAML file in .standards/local/
cat > .standards/local/my-rules.yaml << 'EOF'
id: my-team-rules
priority: 10
rules:
  - action: ALWAYS
    rule: Use TypeScript strict mode
  - action: NEVER
    rule: Use any type
EOF
```

**Update to latest upstream:**
```bash
project-object update
# Deletes opencore/ and community/, re-pulls from upstream
# Your local/ standards are never touched
```

**Share with the community:**
Submit a PR to [Community Standards](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards).

**Keep private:**
Commit `.standards/` to your project's version control. Your local standards stay with your repo.

### How Standards Are Injected

Standards are injected in a compact, token-efficient format. Only rule actions and text are included — descriptions, examples, and anti-patterns are stripped:

```
<project-standards>
# Standards (67 loaded, 808 rules)

## development-principles [priority:10]
- NEVER: Skip unit tests for "simple" changes
- ALWAYS: Write the test first

## error-handling [priority:20]
- ALWAYS: Include error codes in user-facing messages
- NEVER: Catch and swallow errors silently
</project-standards>
```

Standards are sorted by priority (10 = critical, injected first).

## Session Memory

### How It Works

Project/Object installs two Claude Code hooks:

- **session-start** — Injects saved context + standards when Claude Code starts
- **pre-compact** — Harvests important context before session compaction

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

### What Gets Remembered

- Decisions made during sessions
- Patterns and conventions established
- Corrections and clarifications
- Project-specific context you want preserved

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

## Cross-Platform Support

Your context works with multiple AI coding tools:

```bash
project-object sync --cursor     # Creates .cursorrules
project-object sync --codex      # Creates AGENTS.md
project-object sync --windsurf   # Creates .windsurfrules
project-object sync --all        # Sync to all platforms
```

See [docs/CROSS_PLATFORM.md](docs/CROSS_PLATFORM.md) for detailed integration guides.

## Global Context

For context that applies to all your projects:

```bash
project-object init --global
project-object edit --global
```

Global context is injected alongside project context when `include_global: true`. Note: standards are per-project only (not global).

## Configuration

Create `.project-object.yml` in your project root (optional):

```yaml
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

## What Doesn't Happen

- **No cloud sync** — Everything stays on your machine
- **No accounts** — No signup, no login, no tracking
- **No telemetry** — We don't know you're using this
- **No magic** — Simple markdown and YAML files you can read and edit

## Troubleshooting

### Context not injecting?

```bash
# Check hooks are registered
cat .claude/settings.json

# Verify context and standards exist
project-object status
```

### Too much context?

```bash
# Edit and trim manually
project-object edit

# Or set a limit in config
echo "max_context_lines: 100" >> .project-object.yml
```

### Standards not loading?

```bash
# Check standards are pulled
ls .standards/

# Re-pull from upstream
project-object update
```

## Philosophy

Session memory and coding standards should be table stakes for AI coding assistants. This is our contribution to making that happen.

Project/Object is intentionally simple. It solves two problems well: continuity across sessions and consistent coding standards.

If you need more — team collaboration, intelligent curation, analytics, learning that compounds across your organization — check out [MindMeld standards injection](https://mindmeld.dev).

## Why "Project/Object"?

Frank Zappa viewed his entire body of work as a single "Project/Object" — one continuous creative entity where themes, characters, and musical phrases recur and interconnect across albums and decades.

Your codebase deserves the same conceptual continuity. Every session builds on the last. Every decision compounds. One continuous project.

## License

MIT — Frank would have wanted it that way.

---

*This was created in Joe's Garage.*

*A gift from [Equilateral AI](https://equilateral.ai).*

*If you need team collaboration, automatic learning, or enterprise features: [MindMeld standards injection](https://mindmeld.dev)*
