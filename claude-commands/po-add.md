# /po-add

Add an item to the Project/Object context.

## Usage

```
/po-add <section> <content>
```

Examples:
- `/po-add decision Using PostgreSQL for all data storage`
- `/po-add pattern All handlers use wrapHandler pattern`
- `/po-add note Main branch is 'main' not 'master'`

## Arguments

- `section`: One of `decision`, `pattern`, `correction`, `note`
- `content`: The text to add

## Instructions

1. Parse the section and content from the user's input.

2. Read the current context file at `~/.project-object/{project}/context.md`

3. Add the new item to the appropriate section:
   - `decision` → `## Decisions`
   - `pattern` → `## Patterns`
   - `correction` → `## Corrections`
   - `note` → `## Notes`

4. Write the updated file.

5. Confirm the addition to the user.

If no section is specified, ask the user which section to add to.
