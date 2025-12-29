#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const { init } = require('../src/commands/init');
const { status } = require('../src/commands/status');
const { edit } = require('../src/commands/edit');
const { show } = require('../src/commands/show');
const { clear } = require('../src/commands/clear');
const { sync } = require('../src/commands/sync');

const VERSION = require('../package.json').version;

const HELP = `
Project/Object v${VERSION}
Conceptual continuity for Claude Code

Usage: project-object <command> [options]

Commands:
  init [--global]     Setup hooks for current project (or global)
  status              Show context summary for current project
  show                Display full context content
  edit [--global]     Open context file in editor
  clear [--global]    Reset context for project (or global)
  sync [--platform]   Sync context to other AI tools (Cursor, Codex, etc.)
  help                Show this help message
  version             Show version

Options:
  --global, -g        Apply to global context instead of project
  --cursor            Sync to Cursor (.cursorrules)
  --codex             Sync to Codex CLI (AGENTS.md)
  --windsurf          Sync to Windsurf (.windsurfrules)
  --all               Sync to all platforms

Examples:
  project-object init           # Setup for current project
  project-object status         # Check what context exists
  project-object edit           # Manually curate context
  project-object sync           # Sync to detected platforms
  project-object sync --cursor  # Sync to Cursor specifically
  po init --global              # Setup global context

More info: https://github.com/Equilateral-AI/project-object
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = args.slice(1);
  const isGlobal = flags.includes('--global') || flags.includes('-g');

  try {
    switch (command) {
      case 'init':
        await init({ global: isGlobal });
        break;
      case 'status':
        await status({ global: isGlobal });
        break;
      case 'show':
        await show({ global: isGlobal });
        break;
      case 'edit':
        await edit({ global: isGlobal });
        break;
      case 'clear':
        await clear({ global: isGlobal });
        break;
      case 'sync':
        const syncPlatform = flags.find(f => ['--cursor', '--codex', '--windsurf', '--continue'].includes(f));
        const syncAll = flags.includes('--all');
        await sync({
          platform: syncPlatform ? syncPlatform.slice(2) : null,
          all: syncAll,
          force: syncAll
        });
        break;
      case 'version':
      case '-v':
      case '--version':
        console.log(`project-object v${VERSION}`);
        break;
      case 'help':
      case '-h':
      case '--help':
      case undefined:
        console.log(HELP);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
