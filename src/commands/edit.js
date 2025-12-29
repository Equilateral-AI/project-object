/**
 * Open context file in editor
 */

const { spawn } = require('child_process');
const { getProjectName, getContextFilePath, ensureStorageDir } = require('../config');
const fs = require('fs');

async function edit(options = {}) {
  const { global: isGlobal } = options;
  const projectName = isGlobal ? 'global' : getProjectName(process.cwd());

  // Ensure directory and file exist
  ensureStorageDir(projectName, isGlobal);
  const contextFile = getContextFilePath(projectName, isGlobal);

  if (!fs.existsSync(contextFile)) {
    // Create initial file
    const initialContent = `# Project Context: ${projectName}

## Decisions
<!-- Add key decisions made during sessions -->

## Patterns
<!-- Add patterns and conventions to follow -->

## Notes
<!-- Add important notes to remember -->

---
*Created: ${new Date().toISOString()}*
`;
    fs.writeFileSync(contextFile, initialContent, 'utf-8');
  }

  // Get editor from environment
  const editor = process.env.EDITOR || process.env.VISUAL || 'vim';

  console.log(`Opening ${contextFile} in ${editor}...`);

  // Open editor
  const child = spawn(editor, [contextFile], {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`Failed to open editor: ${err.message}`);
    console.log(`\nManually edit: ${contextFile}`);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`\nContext saved.`);
    }
  });
}

module.exports = { edit };
