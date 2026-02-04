/**
 * Initialize Project/Object for a project
 */

const fs = require('fs');
const path = require('path');
const { getProjectName, ensureStorageDir, getContextFilePath } = require('../config');
const { pullStandards, getStandardsPath } = require('../standards/pull');

const SESSION_START_HOOK = `/**
 * Project/Object - Session Start Hook
 * Injects saved context when Claude Code starts
 */

const { inject } = require('@equilateral_ai/project-object');

module.exports = async function sessionStart() {
  const context = inject(process.cwd());

  if (context) {
    return {
      contextAddition: context
    };
  }

  return {};
};
`;

const PRE_COMPACT_HOOK = `/**
 * Project/Object - Pre-Compact Hook
 * Harvests context before session compaction
 */

const fs = require('fs');
const path = require('path');
const { harvest, formatContext, mergeContext } = require('@equilateral_ai/project-object');
const { getProjectName, getContextFilePath, ensureStorageDir } = require('@equilateral_ai/project-object');
const storage = require('@equilateral_ai/project-object').storage;

module.exports = async function preCompact({ transcript }) {
  if (!transcript) {
    return {};
  }

  const projectName = getProjectName(process.cwd());
  ensureStorageDir(projectName);

  // Harvest new context
  const harvested = harvest(transcript);

  // Load existing context
  const existingContent = storage.loadContext(projectName);
  let existing = { decisions: [], patterns: [], corrections: [], notes: [] };

  if (existingContent) {
    // Parse existing (simple extraction)
    const lines = existingContent.split('\\n');
    let currentSection = null;

    for (const line of lines) {
      if (line.startsWith('## Decisions')) currentSection = 'decisions';
      else if (line.startsWith('## Patterns')) currentSection = 'patterns';
      else if (line.startsWith('## Corrections')) currentSection = 'corrections';
      else if (line.startsWith('## Notes')) currentSection = 'notes';
      else if (line.startsWith('## ') || line.startsWith('# ')) currentSection = null;
      else if (currentSection && line.startsWith('- ')) {
        existing[currentSection].push(line.slice(2));
      }
    }
  }

  // Merge and save
  const merged = mergeContext(existing, harvested);
  const formatted = formatContext(merged, projectName);
  storage.saveContext(formatted, projectName);

  return {};
};
`;

async function init(options = {}) {
  const { global: isGlobal } = options;
  const projectPath = process.cwd();
  const projectName = isGlobal ? 'global' : getProjectName(projectPath);

  console.log(`\nProject/Object - Conceptual continuity for Claude Code\n`);

  if (isGlobal) {
    console.log('Initializing global context...\n');
  } else {
    console.log(`Initializing for project: ${projectName}\n`);
  }

  // 1. Create storage directory
  ensureStorageDir(projectName, isGlobal);
  console.log(`  ✓ Storage directory created`);

  // 2. Create initial context file if it doesn't exist
  const contextFile = getContextFilePath(projectName, isGlobal);
  if (!fs.existsSync(contextFile)) {
    const initialContext = `# Project Context: ${projectName}

## Decisions
<!-- Add key decisions made during sessions -->

## Patterns
<!-- Add patterns and conventions to follow -->

## Notes
<!-- Add important notes to remember -->

---
*Created: ${new Date().toISOString()}*
*Edit this file anytime: project-object edit${isGlobal ? ' --global' : ''}*
`;
    fs.writeFileSync(contextFile, initialContext, 'utf-8');
    console.log(`  ✓ Context file created`);
  } else {
    console.log(`  ✓ Context file exists`);
  }

  // 3. Create Claude Code hooks and register in settings.json (if not global)
  if (!isGlobal) {
    const hooksDir = path.join(projectPath, '.claude', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Write session-start hook
    const sessionStartPath = path.join(hooksDir, 'session-start.js');
    if (!fs.existsSync(sessionStartPath)) {
      fs.writeFileSync(sessionStartPath, SESSION_START_HOOK, 'utf-8');
      console.log(`  ✓ Session start hook created`);
    } else {
      console.log(`  ⚠ Session start hook exists (not overwritten)`);
    }

    // Write pre-compact hook
    const preCompactPath = path.join(hooksDir, 'pre-compact.js');
    if (!fs.existsSync(preCompactPath)) {
      fs.writeFileSync(preCompactPath, PRE_COMPACT_HOOK, 'utf-8');
      console.log(`  ✓ Pre-compact hook created`);
    } else {
      console.log(`  ⚠ Pre-compact hook exists (not overwritten)`);
    }

    // Register hooks in .claude/settings.json
    registerHooks(projectPath);
  }

  // 4. Pull standards (if not global and not already present)
  if (!isGlobal) {
    const standardsPath = getStandardsPath(projectPath);
    if (!fs.existsSync(standardsPath)) {
      console.log(`\n  Pulling standards...`);
      try {
        const result = await pullStandards(projectPath);
        const oc = result.opencore ? result.opencore.count : 0;
        const cc = result.community ? result.community.count : 0;
        console.log(`  ✓ Standards pulled (${oc} OpenCore, ${cc} Community)`);
      } catch (err) {
        console.log(`  ⚠ Could not pull standards: ${err.message}`);
        console.log(`    You can try again later with: project-object update`);
      }
    } else {
      console.log(`  ✓ Standards directory exists`);
      console.log(`    Run 'project-object update' to pull latest`);
    }
  }

  console.log(`
Done! Context and standards will now be injected into Claude Code sessions.

Next steps:
  ${isGlobal ? 'project-object edit --global' : 'project-object edit'}    # Add initial context
  project-object status      # Check context and standards
${isGlobal ? '' : '  project-object update     # Pull latest standards\n'}
Context file: ${contextFile}
`);
}

/**
 * Register hooks in .claude/settings.json so Claude Code discovers them
 */
function registerHooks(projectPath) {
  const settingsPath = path.join(projectPath, '.claude', 'settings.json');
  let settings = {};

  // Load existing settings if present
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch (e) {
      // Malformed settings — start fresh but warn
      console.log(`  ⚠ Could not parse existing settings.json, creating new one`);
    }
  }

  // Ensure hooks structure exists
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Register session-start hook
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [];
  }

  const sessionStartEntry = {
    matcher: '',
    hooks: [{
      type: 'command',
      command: 'node .claude/hooks/session-start.js'
    }]
  };

  // Only add if not already registered
  const hasSessionStart = settings.hooks.SessionStart.some(
    entry => entry.hooks && entry.hooks.some(h => h.command && h.command.includes('session-start.js'))
  );

  if (!hasSessionStart) {
    settings.hooks.SessionStart.push(sessionStartEntry);
  }

  // Register pre-compact hook
  if (!settings.hooks.PreCompact) {
    settings.hooks.PreCompact = [];
  }

  const preCompactEntry = {
    matcher: '',
    hooks: [{
      type: 'command',
      command: 'node .claude/hooks/pre-compact.js'
    }]
  };

  const hasPreCompact = settings.hooks.PreCompact.some(
    entry => entry.hooks && entry.hooks.some(h => h.command && h.command.includes('pre-compact.js'))
  );

  if (!hasPreCompact) {
    settings.hooks.PreCompact.push(preCompactEntry);
  }

  // Write settings
  const claudeDir = path.join(projectPath, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  console.log(`  ✓ Hooks registered in .claude/settings.json`);
}

module.exports = { init };
