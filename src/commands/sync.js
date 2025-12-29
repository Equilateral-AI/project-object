/**
 * Sync context to other AI coding platforms
 */

const fs = require('fs');
const path = require('path');
const { getProjectName, getContextFilePath } = require('../config');
const storage = require('../storage/local');

const PLATFORMS = {
  cursor: {
    file: '.cursorrules',
    name: 'Cursor'
  },
  codex: {
    file: 'AGENTS.md',
    name: 'Codex CLI'
  },
  windsurf: {
    file: '.windsurfrules',
    name: 'Windsurf'
  },
  continue: {
    file: '.continue/context.md',
    name: 'Continue.dev'
  }
};

async function sync(options = {}) {
  const { platform, all, force } = options;
  const projectPath = process.cwd();
  const projectName = getProjectName(projectPath);

  // Load context
  const content = storage.loadContext(projectName, false);

  if (!content) {
    console.log(`\nNo context found for ${projectName}.`);
    console.log(`Run 'project-object init' first.`);
    return;
  }

  console.log(`\nProject/Object Sync - ${projectName}\n`);

  // Determine which platforms to sync
  let targets = [];

  if (platform) {
    if (!PLATFORMS[platform]) {
      console.error(`Unknown platform: ${platform}`);
      console.log(`Available: ${Object.keys(PLATFORMS).join(', ')}`);
      return;
    }
    targets = [{ key: platform, ...PLATFORMS[platform] }];
  } else if (all || force) {
    // Sync to all platforms
    targets = Object.entries(PLATFORMS).map(([key, val]) => ({ key, ...val }));
  } else {
    // Auto-detect: only sync if platform file already exists
    targets = Object.entries(PLATFORMS)
      .filter(([key, val]) => {
        const filePath = path.join(projectPath, val.file);
        return fs.existsSync(filePath) || fs.existsSync(path.dirname(filePath));
      })
      .map(([key, val]) => ({ key, ...val }));
  }

  if (targets.length === 0) {
    console.log('No platform files detected in this directory.');
    console.log('\nTo force sync to a specific platform:');
    console.log('  project-object sync --cursor');
    console.log('  project-object sync --codex');
    console.log('  project-object sync --windsurf');
    console.log('\nOr sync to all:');
    console.log('  project-object sync --all');
    return;
  }

  // Add header to context
  const header = `# Project Context: ${projectName}
# Synced by Project/Object - ${new Date().toISOString()}
# Edit via: project-object edit
# https://github.com/Equilateral-AI/project-object

`;

  const syncContent = header + content.replace(/^# Project Context:.*\n/m, '');

  // Sync to each platform
  for (const target of targets) {
    const filePath = path.join(projectPath, target.file);

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, syncContent, 'utf-8');
      console.log(`  ✓ ${target.name}: ${target.file}`);
    } catch (err) {
      console.log(`  ✗ ${target.name}: ${err.message}`);
    }
  }

  console.log('\nSync complete.');
  console.log('\nNote: Only Claude Code auto-harvests context.');
  console.log('Run "project-object sync" after editing to update other platforms.');
}

module.exports = { sync, PLATFORMS };
