/**
 * Inject context into Claude Code session
 *
 * Simple prepending of context markdown. No magic.
 */

const fs = require('fs');
const path = require('path');
const { getProjectName, getContextFilePath, getConfig } = require('./config');

/**
 * Load context for a project
 */
function loadContext(projectName, isGlobal = false) {
  const contextFile = getContextFilePath(projectName, isGlobal);

  if (!fs.existsSync(contextFile)) {
    return null;
  }

  try {
    return fs.readFileSync(contextFile, 'utf-8');
  } catch (e) {
    console.warn(`Warning: Could not read context file: ${e.message}`);
    return null;
  }
}

/**
 * Get combined context (project + optional global)
 */
function getCombinedContext(projectPath = process.cwd()) {
  const config = getConfig(projectPath);
  const projectName = getProjectName(projectPath);

  const parts = [];

  // Project context
  const projectContext = loadContext(projectName, false);
  if (projectContext) {
    parts.push(projectContext);
  }

  // Global context (if enabled)
  if (config.include_global) {
    const globalContext = loadContext(null, true);
    if (globalContext) {
      parts.push(globalContext);
    }
  }

  if (parts.length === 0) {
    return null;
  }

  // Combine and truncate if needed
  let combined = parts.join('\n\n---\n\n');

  if (config.max_context_lines) {
    const lines = combined.split('\n');
    if (lines.length > config.max_context_lines) {
      combined = lines.slice(0, config.max_context_lines).join('\n');
      combined += '\n\n*[Context truncated]*';
    }
  }

  return combined;
}

/**
 * Format context for injection into Claude Code
 */
function formatForInjection(context) {
  if (!context) {
    return '';
  }

  return `<project-object-context>
${context}
</project-object-context>

`;
}

/**
 * Inject context into session (main entry point for hook)
 */
function inject(projectPath = process.cwd()) {
  const context = getCombinedContext(projectPath);

  if (!context) {
    return '';
  }

  return formatForInjection(context);
}

module.exports = {
  inject,
  loadContext,
  getCombinedContext,
  formatForInjection
};
