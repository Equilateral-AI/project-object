# /po-init

Initialize Project/Object for the current project.

## Usage

```
/po-init [--global]
```

## Instructions

Run the following command:

```bash
project-object init
```

Or for global context:
```bash
project-object init --global
```

This creates:
- Claude Code hooks in `.claude/hooks/`
- Context storage in `~/.project-object/{project}/`
- Initial context file template

If project-object is not installed:
```bash
npm install -g @equilateral/project-object
```
