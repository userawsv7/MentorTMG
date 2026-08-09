/**
 * CHEAT SHEET GENERATOR
 * Generates topic-specific quick reference materials
 */

class CheatSheetGenerator {
  static generate(analysis, content) {
    const { classification, questionType } = analysis;

    switch (classification.structure) {
      case 'mathematics':
        return this.generateMathCheatSheet(content, analysis);
      case 'programming':
        return this.generateProgrammingCheatSheet(content, analysis);
      case 'technical-problem':
      case 'troubleshooting':
        return this.generateTechnicalCheatSheet(content, analysis);
      case 'history':
        return this.generateHistoryCheatSheet(content, analysis);
      case 'language-learning':
        return this.generateLanguageCheatSheet(content, analysis);
      case 'philosophy':
      case 'religion-spirituality':
        return this.generatePhilosophyCheatSheet(content, analysis);
      case 'science':
        return this.generateScienceCheatSheet(content, analysis);
      default:
        return this.generateGenericCheatSheet(content, analysis);
    }
  }

  static generateMathCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```math');
    lines.push(`# ${analysis.model.query.toUpperCase()} - QUICK REFERENCE`);
    lines.push('');

    if (content.formula) {
      lines.push('## FORMULA');
      lines.push(content.formula);
      lines.push('');
    }

    if (content.variables) {
      lines.push('## VARIABLES');
      Object.entries(content.variables).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`);
      });
      lines.push('');
    }

    if (content.workedExample) {
      lines.push('## WORKED EXAMPLE');
      lines.push(content.workedExample);
      lines.push('');
    }

    if (content.commonMistakes) {
      lines.push('## COMMON MISTAKES');
      content.commonMistakes.forEach(mistake => {
        lines.push(`❌ ${mistake.mistake} → ✅ ${mistake.correct}`);
      });
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'math',
      downloadable: true
    };
  }

  static generateProgrammingCheatSheet(content, analysis) {
    const lines = [];

    const lang = this.detectLanguage(analysis.model.query);

    lines.push(`\`\`\`${lang}`);
    lines.push(`# ${analysis.model.query.toUpperCase()} - CHEAT SHEET`);
    lines.push('');

    if (content.syntax) {
      lines.push('// SYNTAX');
      lines.push(content.syntax);
      lines.push('');
    }

    if (content.example) {
      lines.push('// EXAMPLE');
      lines.push(content.example);
      lines.push('');
    }

    if (content.commonErrors && Array.isArray(content.commonErrors)) {
      lines.push('// COMMON ERRORS');
      content.commonErrors.forEach(err => {
        lines.push(`// ${err.error}: ${err.cause}`);
      });
      lines.push('');
    }

    if (content.debugging) {
      lines.push('// DEBUGGING');
      lines.push(content.debugging);
      lines.push('');
    }

    if (content.bestPractice) {
      lines.push('// BEST PRACTICES');
      lines.push(content.bestPractice);
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: lang,
      downloadable: true
    };
  }

  static generateTechnicalCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```bash');
    lines.push(`# ${analysis.model.query.toUpperCase()} - DEBUGGING CHEAT SHEET`);
    lines.push('');

    if (content.flow) {
      lines.push('# FLOW');
      lines.push(content.flow);
      lines.push('');
    }

    lines.push('# VERIFICATION COMMANDS');
    lines.push('kubectl get pods                    # Check pod status');
    lines.push('kubectl describe pod <name>         # Get detailed info');
    lines.push('kubectl logs <pod-name>             # View logs');
    lines.push('kubectl get events --sort-by=.lastTimestamp  # Recent events');
    lines.push('');

    if (content.fix) {
      lines.push('# FIX');
      lines.push(content.fix);
      lines.push('');
    }

    lines.push('# VERIFICATION');
    lines.push(content.verification || 'Check status after applying fix');
    lines.push('');

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'bash',
      downloadable: true
    };
  }

  static generateHistoryCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```markdown');
    lines.push(`# ${analysis.model.query.toUpperCase()} - HISTORICAL REFERENCE`);
    lines.push('');

    if (content.period) {
      lines.push('## PERIOD');
      lines.push(content.period);
      lines.push('');
    }

    if (content.people) {
      lines.push('## KEY FIGURES');
      lines.push(content.people);
      lines.push('');
    }

    if (content.events) {
      lines.push('## KEY EVENTS');
      lines.push(content.events);
      lines.push('');
    }

    if (content.causes) {
      lines.push('## CAUSES');
      lines.push(content.causes);
      lines.push('');
    }

    if (content.consequences) {
      lines.push('## CONSEQUENCES');
      lines.push(content.consequences);
      lines.push('');
    }

    if (content.keyFacts) {
      lines.push('## KEY FACTS');
      lines.push(content.keyFacts);
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'markdown',
      downloadable: true
    };
  }

  static generateLanguageCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```text');
    lines.push(`# ${analysis.model.query.toUpperCase()} - LANGUAGE REFERENCE`);
    lines.push('');

    if (content.structure) {
      lines.push('## STRUCTURE');
      lines.push(content.structure);
      lines.push('');
    }

    if (content.examples) {
      lines.push('## EXAMPLES');
      lines.push(content.examples);
      lines.push('');
    }

    if (content.exceptions) {
      lines.push('## EXCEPTIONS');
      lines.push(content.exceptions);
      lines.push('');
    }

    if (content.commonMistakes) {
      lines.push('## COMMON MISTAKES');
      content.commonMistakes.forEach(mistake => {
        lines.push(`❌ ${mistake.mistake}`);
        lines.push(`✅ ${mistake.correct}`);
      });
      lines.push('');
    }

    if (content.practice) {
      lines.push('## PRACTICE');
      lines.push(content.practice);
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'text',
      downloadable: true
    };
  }

  static generatePhilosophyCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```markdown');
    lines.push(`# ${analysis.model.query.toUpperCase()} - PHILOSOPHICAL REFERENCE`);
    lines.push('');

    if (content.philosopher) {
      lines.push('## PHILOSOPHER');
      lines.push(content.philosopher);
      lines.push('');
    }

    if (content.coreIdea) {
      lines.push('## CORE IDEA');
      lines.push(content.coreIdea);
      lines.push('');
    }

    if (content.definitions) {
      lines.push('## KEY DEFINITIONS');
      lines.push(content.definitions);
      lines.push('');
    }

    if (content.argument) {
      lines.push('## MAIN ARGUMENT');
      lines.push(content.argument);
      lines.push('');
    }

    if (content.counterargument) {
      lines.push('## COUNTERARGUMENT');
      lines.push(content.counterargument);
      lines.push('');
    }

    if (content.example) {
      lines.push('## EXAMPLE');
      lines.push(content.example);
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'markdown',
      downloadable: true
    };
  }

  static generateScienceCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```text');
    lines.push(`# ${analysis.model.query.toUpperCase()} - SCIENCE REFERENCE`);
    lines.push('');

    if (content.concept) {
      lines.push('## CONCEPT');
      lines.push(content.concept);
      lines.push('');
    }

    if (content.principles) {
      lines.push('## PRINCIPLES');
      lines.push(content.principles);
      lines.push('');
    }

    if (content.mechanism) {
      lines.push('## MECHANISM');
      lines.push(content.mechanism);
      lines.push('');
    }

    if (content.causeEffect) {
      lines.push('## CAUSE → EFFECT');
      lines.push(content.causeEffect);
      lines.push('');
    }

    if (content.example) {
      lines.push('## EXAMPLE');
      lines.push(content.example);
      lines.push('');
    }

    if (content.commonMisconceptions) {
      lines.push('## COMMON MISCONCEPTIONS');
      lines.push(content.commonMisconceptions);
      lines.push('');
    }

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'text',
      downloadable: true
    };
  }

  static generateGenericCheatSheet(content, analysis) {
    const lines = [];

    lines.push('```markdown');
    lines.push(`# ${analysis.model.query.toUpperCase()} - QUICK REFERENCE`);
    lines.push('');

    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 10) {
        lines.push(`## ${key.toUpperCase()}`);
        lines.push(value);
        lines.push('');
      }
    });

    lines.push('```');

    return {
      content: lines.join('\n'),
      language: 'markdown',
      downloadable: true
    };
  }

  static detectLanguage(query) {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('javascript') || queryLower.includes('js')) return 'javascript';
    if (queryLower.includes('python')) return 'python';
    if (queryLower.includes('typescript') || queryLower.includes('ts')) return 'typescript';
    if (queryLower.includes('bash') || queryLower.includes('shell')) return 'bash';
    if (queryLower.includes('sql')) return 'sql';
    if (queryLower.includes('yaml')) return 'yaml';
    if (queryLower.includes('json')) return 'json';
    if (queryLower.includes('terraform')) return 'terraform';

    return 'javascript'; // Default
  }

  static formatForCopy(cheatSheet) {
    // Return clean, copyable content
    return cheatSheet.content.replace(/```[\w]*\n/g, '').replace(/```$/, '');
  }
}

module.exports = CheatSheetGenerator;