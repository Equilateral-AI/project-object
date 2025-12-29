/**
 * Harvest context from Claude Code session transcript
 *
 * This is intentionally simple - pattern matching on common phrases.
 * No ML, no cloud, no magic.
 */

const { getConfig } = require('./config');

/**
 * Extract key context from a session transcript
 */
function harvest(transcript, options = {}) {
  const config = getConfig();
  const lines = transcript.split('\n');
  const context = {
    decisions: [],
    patterns: [],
    corrections: [],
    notes: []
  };

  // Filter out excluded patterns (privacy)
  const excludePatterns = config.exclude_patterns || [];
  const filteredLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return !excludePatterns.some(pattern => lower.includes(pattern.toLowerCase()));
  });

  const text = filteredLines.join('\n');

  // Extract decisions (simple pattern matching)
  const decisionPatterns = [
    /(?:we(?:'ll| will| should)?|let's|going to|decided to|agreed to)\s+(.+?)(?:\.|$)/gi,
    /decision:\s*(.+?)(?:\.|$)/gi,
    /(?:using|chose|picking|selected)\s+(\w+(?:\s+\w+)?)\s+(?:for|because|since)/gi
  ];

  for (const pattern of decisionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const decision = match[1].trim();
      if (decision.length > 10 && decision.length < 200) {
        context.decisions.push(decision);
      }
    }
  }

  // Extract patterns/conventions
  const patternPatterns = [
    /(?:always|never|pattern|convention|standard):\s*(.+?)(?:\.|$)/gi,
    /(?:we always|we never|always use|never use)\s+(.+?)(?:\.|$)/gi,
    /(?:the pattern is|the convention is)\s+(.+?)(?:\.|$)/gi
  ];

  for (const pattern of patternPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const found = match[1].trim();
      if (found.length > 10 && found.length < 200) {
        context.patterns.push(found);
      }
    }
  }

  // Extract corrections
  const correctionPatterns = [
    /(?:actually|correction|no,|not .+?, but)\s+(.+?)(?:\.|$)/gi,
    /(?:that's wrong|that's incorrect|should be)\s+(.+?)(?:\.|$)/gi,
    /(?:instead of .+?, use)\s+(.+?)(?:\.|$)/gi
  ];

  for (const pattern of correctionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const correction = match[1].trim();
      if (correction.length > 10 && correction.length < 200) {
        context.corrections.push(correction);
      }
    }
  }

  // Extract explicit notes (user-marked)
  const notePatterns = [
    /(?:note:|remember:|important:)\s*(.+?)(?:\.|$)/gi,
    /(?:don't forget|keep in mind)\s+(.+?)(?:\.|$)/gi
  ];

  for (const pattern of notePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const note = match[1].trim();
      if (note.length > 5 && note.length < 300) {
        context.notes.push(note);
      }
    }
  }

  // Deduplicate
  context.decisions = [...new Set(context.decisions)];
  context.patterns = [...new Set(context.patterns)];
  context.corrections = [...new Set(context.corrections)];
  context.notes = [...new Set(context.notes)];

  return context;
}

/**
 * Format harvested context as markdown
 */
function formatContext(context, projectName) {
  const lines = [`# Project Context: ${projectName}`, ''];

  if (context.decisions.length > 0) {
    lines.push('## Decisions');
    context.decisions.forEach(d => lines.push(`- ${d}`));
    lines.push('');
  }

  if (context.patterns.length > 0) {
    lines.push('## Patterns');
    context.patterns.forEach(p => lines.push(`- ${p}`));
    lines.push('');
  }

  if (context.corrections.length > 0) {
    lines.push('## Corrections');
    context.corrections.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  if (context.notes.length > 0) {
    lines.push('## Notes');
    context.notes.forEach(n => lines.push(`- ${n}`));
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`*Last updated: ${new Date().toISOString()}*`);

  return lines.join('\n');
}

/**
 * Merge new context with existing context
 */
function mergeContext(existing, harvested) {
  // Simple merge: append new items, deduplicate
  const merged = {
    decisions: [...(existing.decisions || []), ...(harvested.decisions || [])],
    patterns: [...(existing.patterns || []), ...(harvested.patterns || [])],
    corrections: [...(existing.corrections || []), ...(harvested.corrections || [])],
    notes: [...(existing.notes || []), ...(harvested.notes || [])]
  };

  // Deduplicate
  merged.decisions = [...new Set(merged.decisions)];
  merged.patterns = [...new Set(merged.patterns)];
  merged.corrections = [...new Set(merged.corrections)];
  merged.notes = [...new Set(merged.notes)];

  return merged;
}

module.exports = {
  harvest,
  formatContext,
  mergeContext
};
