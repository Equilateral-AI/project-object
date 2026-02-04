/**
 * Standards injection for AI coding sessions
 *
 * Reads all YAML standards from .standards/, extracts compact rule format,
 * and wraps in <project-standards> tags for context injection.
 *
 * Only rules (action + rule text) are injected — anti_patterns, examples,
 * context, and description are stripped for token efficiency.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { getStandardsPath } = require('./pull');
const { findYamlFiles } = require('./scan');

/**
 * Format a single parsed standard into compact injection format
 */
function formatStandardCompact(parsed) {
  if (!parsed || !Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    return null;
  }

  const id = parsed.id || 'unknown';
  const priority = parsed.priority || 30;
  const lines = [`## ${id} [priority:${priority}]`];

  for (const rule of parsed.rules) {
    if (rule.action && rule.rule) {
      lines.push(`- ${rule.action}: ${rule.rule}`);
    }
  }

  return lines.join('\n');
}

/**
 * Load and format all standards for injection
 */
function injectStandards(projectPath = process.cwd()) {
  const standardsPath = getStandardsPath(projectPath);

  if (!fs.existsSync(standardsPath)) {
    return '';
  }

  // Collect all YAML files across all sources
  const allFiles = [];
  for (const source of ['opencore', 'community', 'local']) {
    const sourceDir = path.join(standardsPath, source);
    const files = findYamlFiles(sourceDir);
    allFiles.push(...files);
  }

  if (allFiles.length === 0) {
    return '';
  }

  // Parse and format each standard
  const formatted = [];
  let totalRules = 0;

  // Parse all files with priority for sorting
  const parsed = [];
  for (const filePath of allFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const standard = yaml.parse(content);
      if (standard) {
        parsed.push(standard);
      }
    } catch (e) {
      // Skip malformed files silently during injection
    }
  }

  // Sort by priority (10 = critical first)
  parsed.sort((a, b) => (a.priority || 30) - (b.priority || 30));

  // Format each standard
  for (const standard of parsed) {
    const compact = formatStandardCompact(standard);
    if (compact) {
      formatted.push(compact);
      totalRules += Array.isArray(standard.rules) ? standard.rules.length : 0;
    }
  }

  if (formatted.length === 0) {
    return '';
  }

  // Build injection block
  const header = `# Standards (${formatted.length} loaded, ${totalRules} rules)`;
  const body = formatted.join('\n\n');

  return `<project-standards>\n${header}\n\n${body}\n</project-standards>\n`;
}

module.exports = { injectStandards, formatStandardCompact };
