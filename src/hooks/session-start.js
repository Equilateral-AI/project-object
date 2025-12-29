/**
 * Project/Object - Session Start Hook Template
 *
 * Copy this to your project's .claude/hooks/session-start.js
 * or run `project-object init` to install automatically.
 */

const { inject } = require('@equilateral/project-object');

module.exports = async function sessionStart() {
  const context = inject(process.cwd());

  if (context) {
    return {
      contextAddition: context
    };
  }

  return {};
};
