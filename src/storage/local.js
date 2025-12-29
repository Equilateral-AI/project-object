/**
 * Local file storage for Project/Object context
 *
 * Simple markdown files in ~/.project-object/{project}/
 */

const fs = require('fs');
const path = require('path');
const { getContextFilePath, ensureStorageDir, getProjectName } = require('../config');

/**
 * Save context to local storage
 */
function saveContext(content, projectName, isGlobal = false) {
  ensureStorageDir(projectName, isGlobal);
  const contextFile = getContextFilePath(projectName, isGlobal);

  fs.writeFileSync(contextFile, content, 'utf-8');
  return contextFile;
}

/**
 * Load context from local storage
 */
function loadContext(projectName, isGlobal = false) {
  const contextFile = getContextFilePath(projectName, isGlobal);

  if (!fs.existsSync(contextFile)) {
    return null;
  }

  return fs.readFileSync(contextFile, 'utf-8');
}

/**
 * Check if context exists
 */
function contextExists(projectName, isGlobal = false) {
  const contextFile = getContextFilePath(projectName, isGlobal);
  return fs.existsSync(contextFile);
}

/**
 * Delete context
 */
function deleteContext(projectName, isGlobal = false) {
  const contextFile = getContextFilePath(projectName, isGlobal);

  if (fs.existsSync(contextFile)) {
    fs.unlinkSync(contextFile);
    return true;
  }

  return false;
}

/**
 * Get context stats
 */
function getContextStats(projectName, isGlobal = false) {
  const contextFile = getContextFilePath(projectName, isGlobal);

  if (!fs.existsSync(contextFile)) {
    return null;
  }

  const stats = fs.statSync(contextFile);
  const content = fs.readFileSync(contextFile, 'utf-8');
  const lines = content.split('\n');

  return {
    path: contextFile,
    size: stats.size,
    lines: lines.length,
    modified: stats.mtime,
    sections: countSections(content)
  };
}

/**
 * Count sections in context markdown
 */
function countSections(content) {
  const sections = {
    decisions: 0,
    patterns: 0,
    corrections: 0,
    notes: 0
  };

  const lines = content.split('\n');
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('## Decisions')) currentSection = 'decisions';
    else if (line.startsWith('## Patterns')) currentSection = 'patterns';
    else if (line.startsWith('## Corrections')) currentSection = 'corrections';
    else if (line.startsWith('## Notes')) currentSection = 'notes';
    else if (line.startsWith('## ') || line.startsWith('# ') || line.startsWith('---')) {
      currentSection = null;
    } else if (currentSection && line.startsWith('- ')) {
      sections[currentSection]++;
    }
  }

  return sections;
}

/**
 * List all projects with context
 */
function listProjects() {
  const { STORAGE_DIR } = require('../config');

  if (!fs.existsSync(STORAGE_DIR)) {
    return [];
  }

  return fs.readdirSync(STORAGE_DIR)
    .filter(name => {
      const contextFile = path.join(STORAGE_DIR, name, 'context.md');
      return fs.existsSync(contextFile);
    });
}

module.exports = {
  saveContext,
  loadContext,
  contextExists,
  deleteContext,
  getContextStats,
  listProjects
};
