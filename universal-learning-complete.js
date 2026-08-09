/**
 * UNIVERSAL LEARNING SYSTEM - COMPLETE IMPLEMENTATION
 * Fully functional system that adapts to any topic
 */

const { UniversalLearningSystem: BaseSystem } = require('./universal-learning-system');
const ContentGenerator = require('./content-generator');
const DiagramRenderer = require('./diagram-renderer');
const CheatSheetGenerator = require('./cheat-sheet-generator');
const VisualOutput = require('./visual-output');

class UniversalLearningSystemComplete {
  static analyze(query, context = {}) {
    // Step 1: Use base classification
    const baseAnalysis = BaseSystem.analyze(query, context);

    // Step 2: Generate actual content for the topic
    const content = ContentGenerator.generate(
      query,
      baseAnalysis.sections,
      baseAnalysis.classification
    );

    // Step 3: Enhance with actual content
    const enhancedAnalysis = {
      ...baseAnalysis,
      content,
      diagram: {
        ...baseAnalysis.diagram,
        rendered: DiagramRenderer.render(baseAnalysis, content)
      },
      cheatSheet: CheatSheetGenerator.generate(baseAnalysis, content),
      visualOutput: VisualOutput.render(baseAnalysis, content)
    };

    return enhancedAnalysis;
  }

  static render(query, options = {}) {
    const analysis = this.analyze(query);

    if (options.compact) {
      return VisualOutput.renderCompact(analysis, analysis.content);
    }

    return analysis.visualOutput;
  }

  static getCheatSheet(query) {
    const analysis = this.analyze(query);
    return analysis.cheatSheet;
  }

  static getDiagram(query) {
    const analysis = this.analyze(query);
    return analysis.diagram.rendered;
  }
}

// Test the complete system
if (require.main === module) {
  console.log('Testing Complete Universal Learning System...\n');

  const testQueries = [
    "What is Ohm's Law and how does it work?",
    "How do I fix Kubernetes pod crashloop backoff?",
    "Explain the Industrial Revolution causes and effects",
    "What's the difference between let and const in JavaScript?",
    "How to conjugate Spanish verbs in present tense?"
  ];

  testQueries.forEach((query, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST ${index + 1}: ${query}`);
    console.log('='.repeat(80));

    const output = UniversalLearningSystemComplete.render(query);
    console.log(output.substring(0, 2000)); // Limit output length
    console.log('...\n');
  });
}

module.exports = UniversalLearningSystemComplete;