/**
 * Project/Object - Pre-Compact Hook Template
 *
 * Copy this to your project's .claude/hooks/pre-compact.js
 * or run `project-object init` to install automatically.
 */

const { harvest, formatContext, mergeContext, storage, getProjectName, getContextFilePath, ensureStorageDir } = require('@equilateral/project-object');

module.exports = async function preCompact({ transcript }) {
  if (!transcript) {
    return {};
  }

  const projectName = getProjectName(process.cwd());
  ensureStorageDir(projectName);

  // Harvest new context from transcript
  const harvested = harvest(transcript);

  // Check if anything was found
  const hasContent = Object.values(harvested).some(arr => arr.length > 0);
  if (!hasContent) {
    return {};
  }

  // Load existing context
  const existingContent = storage.loadContext(projectName);
  let existing = { decisions: [], patterns: [], corrections: [], notes: [] };

  if (existingContent) {
    // Parse existing markdown into structured data
    const lines = existingContent.split('\n');
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

  // Merge new with existing
  const merged = mergeContext(existing, harvested);

  // Format and save
  const formatted = formatContext(merged, projectName);
  storage.saveContext(formatted, projectName);

  console.log(`[Project/Object] Context updated for ${projectName}`);

  return {};
};
