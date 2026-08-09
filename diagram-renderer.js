/**
 * DIAGRAM RENDERER
 * Renders visual diagrams with actual subject-specific knowledge
 */

class DiagramRenderer {
  static render(analysis, content) {
    const { diagram, classification } = analysis;

    switch (diagram.type) {
      case 'formula-flow':
        return this.renderFormulaDiagram(content, analysis);
      case 'timeline-causal':
        return this.renderTimelineDiagram(content, analysis);
      case 'system-flow':
        return this.renderSystemDiagram(content, analysis);
      case 'code-flow':
        return this.renderCodeDiagram(content, analysis);
      case 'concept-map':
      default:
        return this.renderConceptDiagram(content, analysis);
    }
  }

  static renderFormulaDiagram(content, analysis) {
    const lines = [];

    // Header
    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│                    ${analysis.model.query.toUpperCase().padEnd(45)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    // Formula
    if (content.formula) {
      lines.push(`│  FORMULA                                                    │`);
      lines.push(`│    ${content.formula.padEnd(55)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Variables
    if (content.variables) {
      lines.push(`│  VARIABLES                                                  │`);
      Object.entries(content.variables).forEach(([key, value]) => {
        const line = `│    ${key} = ${value}`.padEnd(61) + `│`;
        lines.push(line);
      });
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Relationships
    if (content.meaning) {
      lines.push(`│  RELATIONSHIP                                               │`);
      lines.push(`│    ${content.meaning.substring(0, 55).padEnd(55)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Example
    if (content.workedExample) {
      lines.push(`│  EXAMPLE                                                    │`);
      const exampleLines = content.workedExample.split('\n');
      exampleLines.forEach(line => {
        lines.push(`│    ${line.substring(0, 55).padEnd(55)}│`);
      });
    }

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderTimelineDiagram(content, analysis) {
    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│              HISTORICAL ANALYSIS: ${analysis.model.query.substring(0, 25).padEnd(25)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    // Period
    if (content.period) {
      lines.push(`│  PERIOD: ${content.period.substring(0, 50).padEnd(50)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Causes → Events → Consequences flow
    if (content.causes) {
      lines.push(`│  CAUSES                                                     │`);
      lines.push(`│    ${content.causes.substring(0, 55).padEnd(55)}│`);
    }

    lines.push(`│                           ↓                                 │`);

    if (content.events) {
      lines.push(`│  KEY EVENTS                                                 │`);
      lines.push(`│    ${content.events.substring(0, 55).padEnd(55)}│`);
    }

    lines.push(`│                           ↓                                 │`);

    if (content.consequences) {
      lines.push(`│  CONSEQUENCES                                               │`);
      lines.push(`│    ${content.consequences.substring(0, 55).padEnd(55)}│`);
    }

    if (content.context) {
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
      lines.push(`│  CONTEXT: ${content.context.substring(0, 47).padEnd(47)}│`);
    }

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderSystemDiagram(content, analysis) {
    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│           SYSTEM ANALYSIS: ${analysis.model.query.substring(0, 30).padEnd(30)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    // Architecture
    if (content.architecture) {
      lines.push(`│  ARCHITECTURE                                               │`);
      lines.push(`│    ${content.architecture.substring(0, 55).padEnd(55)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Components with roles
    if (content.components && Array.isArray(content.components)) {
      lines.push(`│  COMPONENTS                                                 │`);
      content.components.forEach(comp => {
        const line = `│    ${comp.name} → ${comp.role}`.substring(0, 59).padEnd(59) + `│`;
        lines.push(line);
      });
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Flow
    if (content.flow) {
      lines.push(`│  FLOW                                                       │`);
      lines.push(`│    ${content.flow.substring(0, 55).padEnd(55)}│`);
    }

    // Problem to Fix
    if (content.problem) {
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
      lines.push(`│  PROBLEM: ${content.problem.substring(0, 47).padEnd(47)}│`);
    }

    if (content.rootCause) {
      lines.push(`│  ROOT CAUSE: ${content.rootCause.substring(0, 44).padEnd(44)}│`);
    }

    if (content.fix) {
      lines.push(`│  FIX: ${content.fix.substring(0, 51).padEnd(51)}│`);
    }

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderCodeDiagram(content, analysis) {
    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│        CODE CONCEPT: ${analysis.model.query.substring(0, 35).padEnd(35)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    // Concept
    if (content.definition) {
      lines.push(`│  ${content.definition.substring(0, 59).padEnd(59)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    }

    // Syntax
    if (content.syntax) {
      lines.push(`│  SYNTAX                                                     │`);
      lines.push(`│    ${content.syntax.substring(0, 55).padEnd(55)}│`);
    }

    // Flow
    if (content.executionFlow) {
      lines.push(`│  EXECUTION: ${content.executionFlow.substring(0, 45).padEnd(45)}│`);
    }

    // Example
    if (content.example) {
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
      lines.push(`│  EXAMPLE                                                    │`);
      lines.push(`│    ${content.example.substring(0, 55).padEnd(55)}│`);
    }

    // Common Errors
    if (content.commonErrors && Array.isArray(content.commonErrors)) {
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
      lines.push(`│  COMMON ERRORS                                              │`);
      content.commonErrors.forEach(err => {
        const line = `│    ${err.error}: ${err.cause}`.substring(0, 59).padEnd(59) + `│`;
        lines.push(line);
      });
    }

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderConceptDiagram(content, analysis) {
    const lines = [];
    const sections = Object.keys(content).slice(0, 6); // Limit to 6 sections

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│           CONCEPT MAP: ${analysis.model.query.substring(0, 32).padEnd(32)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    sections.forEach((section, index) => {
      const sectionContent = content[section];
      let displayContent = '';

      if (typeof sectionContent === 'string') {
        displayContent = sectionContent.substring(0, 55);
      } else if (Array.isArray(sectionContent)) {
        displayContent = sectionContent.map(item =>
          typeof item === 'object' ? item.name || item.mistake : item
        ).join(', ').substring(0, 55);
      } else if (typeof sectionContent === 'object') {
        displayContent = Object.keys(sectionContent).join(', ').substring(0, 55);
      }

      lines.push(`│  ${section.toUpperCase()}: ${displayContent.padEnd(55 - section.length - 2)}│`);

      if (index < sections.length - 1) {
        lines.push(`│                           ↓                                 │`);
      }
    });

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderLearningProgression(progression, level) {
    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│                    LEARNING PROGRESSION                     │`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);
    lines.push(`│  BEGINNER    │  ${progression.beginner.substring(0, 43).padEnd(43)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);
    lines.push(`│  INTERMEDIATE│  ${progression.intermediate.substring(0, 43).padEnd(43)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);
    lines.push(`│  EXPERT      │  ${progression.expert.substring(0, 43).padEnd(43)}│`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);
    lines.push(`│  CURRENT: ${level.toUpperCase().padEnd(49)}│`);
    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderMistakesTable(mistakes) {
    if (!mistakes || mistakes.length === 0) return '';

    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│                    COMMON MISTAKES                          │`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);
    lines.push(`│  MISTAKE              │  WHY              │  CORRECT        │`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    mistakes.forEach(mistake => {
      const mistakeCol = mistake.mistake.substring(0, 20).padEnd(20);
      const reasonCol = mistake.reason.substring(0, 17).padEnd(17);
      const correctCol = mistake.correct.substring(0, 15).padEnd(15);
      lines.push(`│  ${mistakeCol}│  ${reasonCol}│  ${correctCol}│`);
    });

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }

  static renderMisconceptions(misconceptions) {
    if (!misconceptions || misconceptions.length === 0) return '';

    const lines = [];

    lines.push(`┌─────────────────────────────────────────────────────────────┐`);
    lines.push(`│                 MISCONCEPTIONS → TRUTH                      │`);
    lines.push(`├─────────────────────────────────────────────────────────────┤`);

    misconceptions.forEach(misconception => {
      lines.push(`│  ❌ ${misconception.belief.substring(0, 56).padEnd(56)}│`);
      lines.push(`│  ✅ ${misconception.truth.substring(0, 56).padEnd(56)}│`);
      lines.push(`│  📚 ${misconception.evidence.substring(0, 56).padEnd(56)}│`);
      lines.push(`├─────────────────────────────────────────────────────────────┤`);
    });

    lines.push(`└─────────────────────────────────────────────────────────────┘`);

    return lines.join('\n');
  }
}

module.exports = DiagramRenderer;