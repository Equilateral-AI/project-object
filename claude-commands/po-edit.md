# /po-edit

Edit the Project/Object context file directly.

## Usage

```
/po-edit
```

## Instructions

1. First, show the current context file path:
```bash
project-object status
```

2. Read the context file at `~/.project-object/{project}/context.md`

3. Ask the user what they want to add, remove, or change.

4. Write the updated content back to the file.

The context file uses this format:

```markdown
# Project Context: {project-name}

## Decisions
- Key decisions made during sessions

## Patterns
- Patterns and conventions to follow

## Corrections
- Important corrections and clarifications

## Notes
- General notes and reminders
```
