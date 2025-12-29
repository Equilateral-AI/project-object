/**
 * Configuration handling for Project/Object
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILENAME = '.project-object.yml';
const STORAGE_DIR = path.join(os.homedir(), '.project-object');

const DEFAULT_CONFIG = {
  scope: 'project',
  max_context_lines: 200,
  exclude_patterns: ['password', 'secret', 'api_key', 'token', 'credential'],
  include_global: true
};

/**
 * Get project name from git remote or folder name
 */
function getProjectName(projectPath = process.cwd()) {
  // Try git remote first
  try {
    const gitConfigPath = path.join(projectPath, '.git', 'config');
    if (fs.existsSync(gitConfigPath)) {
      const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
      const match = gitConfig.match(/url = .*[\/:]([^\/]+)\.git/);
      if (match) {
        return match[1];
      }
    }
  } catch (e) {
    // Fall through to folder name
  }

  // Fall back to folder name
  return path.basename(projectPath);
}

/**
 * Get path to context storage
 */
function getContextPath(projectName, isGlobal = false) {
  const scope = isGlobal ? 'global' : projectName;
  return path.join(STORAGE_DIR, scope);
}

/**
 * Get context file path
 */
function getContextFilePath(projectName, isGlobal = false) {
  return path.join(getContextPath(projectName, isGlobal), 'context.md');
}

/**
 * Load configuration from .project-object.yml or defaults
 */
function getConfig(projectPath = process.cwd()) {
  const configPath = path.join(projectPath, CONFIG_FILENAME);

  if (fs.existsSync(configPath)) {
    try {
      const yaml = require('yaml');
      const content = fs.readFileSync(configPath, 'utf-8');
      const userConfig = yaml.parse(content);
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (e) {
      console.warn(`Warning: Could not parse ${CONFIG_FILENAME}, using defaults`);
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(projectName, isGlobal = false) {
  const contextPath = getContextPath(projectName, isGlobal);
  if (!fs.existsSync(contextPath)) {
    fs.mkdirSync(contextPath, { recursive: true });
  }
  return contextPath;
}

module.exports = {
  getProjectName,
  getContextPath,
  getContextFilePath,
  getConfig,
  ensureStorageDir,
  STORAGE_DIR,
  DEFAULT_CONFIG
};
