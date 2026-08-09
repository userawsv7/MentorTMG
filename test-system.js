const { UniversalLearningSystem } = require('./universal-learning-system');

// Test cases for different topic types
const testCases = [
  "What is Ohm's Law and how does it work?",
  "How do I fix Kubernetes pod crashloop backoff?",
  "Explain the Industrial Revolution causes and effects",
  "What's the difference between let and const in JavaScript?",
  "How to conjugate Spanish verbs in present tense?",
  "What is existentialism philosophy?",
  "Calculate the derivative of x^2"
];

console.log("Testing Universal Learning System...\n");

testCases.forEach((query, index) => {
  console.log(`\n=== Test ${index + 1}: ${query} ===\n`);
  const analysis = UniversalLearningSystem.analyze(query);
  console.log("Classification:", analysis.classification);
  console.log("Question Type:", analysis.questionType);
  console.log("Sections:", analysis.sections);
  console.log("Progression:", analysis.progression);
  console.log("Mistakes Count:", analysis.mistakes.length);
  console.log("Diagram Type:", analysis.diagram.type);
});