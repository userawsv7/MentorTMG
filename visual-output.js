/**
 * VISUAL OUTPUT RENDERER
 * Produces the complete visual learning output
 */

const DiagramRenderer = require('./diagram-renderer');
const CheatSheetGenerator = require('./cheat-sheet-generator');

class VisualOutput {
  static render(analysis, content) {
    const output = [];

    // Header
    output.push(this.renderHeader(analysis));

    // Main Diagram
    output.push('\n' + DiagramRenderer.render(analysis, content));

    // Learning Progression (if applicable)
    if (analysis.progression && analysis.level) {
      output.push('\n' + DiagramRenderer.renderLearningProgression(
        analysis.progression,
        analysis.level
      ));
    }

    // Misconceptions (if any)
    if (content.misconceptions) {
      output.push('\n' + DiagramRenderer.renderMisconceptions(
        Array.isArray(content.misconceptions)
          ? content.misconceptions
          : [content.misconceptions]
      ));
    }

    // Common Mistakes Table
    if (analysis.mistakes && analysis.mistakes.length > 0) {
      output.push('\n' + DiagramRenderer.renderMistakesTable(analysis.mistakes));
    }

    // Cheat Sheet
    const cheatSheet = CheatSheetGenerator.generate(analysis, content);
    if (cheatSheet) {
      output.push('\n' + this.renderCheatSheet(cheatSheet));
    }

    // Footer with verification
    output.push('\n' + this.renderFooter(analysis));

    return output.join('\n');
  }

  static renderHeader(analysis) {
    const { classification, questionType, model } = analysis;

    const lines = [];
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║           UNIVERSAL LEARNING SYSTEM                          ║');
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push(`║  TOPIC: ${model.query.substring(0, 50).padEnd(50)}║`);
    lines.push(`║  TYPE: ${classification.type.toUpperCase().padEnd(10)} │ STRUCTURE: ${classification.structure.substring(0, 25).padEnd(25)}║`);
    lines.push(`║  QUESTION: ${questionType.toUpperCase().padEnd(46)}║`);
    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  static renderCheatSheet(cheatSheet) {
    const lines = [];

    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│                    CHEAT SHEET                              │');
    lines.push('│              (Copy the block below)                         │');
    lines.push('├─────────────────────────────────────────────────────────────┤');

    // Add the cheat sheet content with proper formatting
    const cheatLines = cheatSheet.content.split('\n');
    cheatLines.forEach(line => {
      // Truncate long lines to fit the box
      const displayLine = line.length > 59 ? line.substring(0, 56) + '...' : line;
      lines.push(`│  ${displayLine.padEnd(57)}│`);
    });

    lines.push('└─────────────────────────────────────────────────────────────┘');

    // Copy instruction
    lines.push('');
    lines.push('📋 TO COPY: Select the code block above (triple-click to select all)');
    lines.push(`   Language: ${cheatSheet.language} | Downloadable: ${cheatSheet.downloadable ? 'Yes' : 'No'}`);

    return lines.join('\n');
  }

  static renderFooter(analysis) {
    const lines = [];

    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│                    VERIFICATION CHECKLIST                   │');
    lines.push('├─────────────────────────────────────────────────────────────┤');

    const checks = [
      '✓ Beginner can understand the basic idea',
      '✓ Intermediate learner can see how it works',
      '✓ Advanced learner can see deeper reasoning',
      '✓ User can apply the knowledge practically',
      '✓ Common mistakes are clearly identified',
      '✓ Truth separated from assumptions',
      '✓ Diagram explains the subject',
      '✓ Cheat sheet provides future reference'
    ];

    checks.forEach(check => {
      lines.push(`│  ${check.padEnd(57)}│`);
    });

    lines.push('├─────────────────────────────────────────────────────────────┤');
    lines.push('│  GOAL: Understand → Reason → Apply → Verify → Learn        │');
    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  static renderCompact(analysis, content) {
    // Compact version for simple questions
    const output = [];

    output.push(`## ${analysis.model.query}`);
    output.push('');

    // Just the key diagram
    output.push(DiagramRenderer.render(analysis, content));

    // Quick cheat sheet if beneficial
    if (['programming', 'mathematics', 'technical-problem'].includes(analysis.classification.structure)) {
      const cheatSheet = CheatSheetGenerator.generate(analysis, content);
      output.push('\n### Quick Reference');
      output.push(cheatSheet.content);
    }

    return output.join('\n');
  }
}

module.exports = VisualOutput;