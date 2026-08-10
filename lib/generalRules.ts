// General Rules Framework for MentorTMG Application
// This module defines the core principles that apply across all functionalities

export interface GeneralRule {
  id: string;
  category: string;
  rule: string;
  implementation: string;
  commit?: string;
}

export const GENERAL_RULES: GeneralRule[] = [
  {
    id: "GR001",
    category: "Task Management",
    rule: "Split all requirements into small tasks, never implement all at once",
    implementation: "Each feature/bug fix must be a separate, focused task",
    commit: "Reference commit b6c2496"
  },
  {
    id: "GR002",
    category: "Task Management",
    rule: "Create branch and push to GitHub after every completed task",
    implementation: "Never batch multiple changes; each task gets its own branch",
    commit: "Reference commit 986f453"
  },
  {
    id: "GR003",
    category: "Prompt Engineering",
    rule: "Always provide best prompts to AI before giving to user",
    implementation: "Prompts must be ordered, easy to learn, visually simple but with good understanding",
    commit: "Reference commit 725f954"
  },
  {
    id: "GR004",
    category: "Problem Solving",
    rule: "Not just solve, but face problem without judgment, observe, find root cause",
    implementation: "Remove root cause and fix; provide summary of what's done",
    commit: "Reference commit 39f417a"
  },
  {
    id: "GR005",
    category: "Session Management",
    rule: "Provide relevant session names based on chat session content",
    implementation: "Session names must reflect actual conversation topics and purpose",
    commit: "Reference commit 4895963"
  },
  {
    id: "GR006",
    category: "Learning Analytics",
    rule: "Record all topics, identify weaknesses/good areas, track improvements",
    implementation: "Track user strengths and areas needing improvement systematically",
    commit: "Reference commit add857d"
  },
  {
    id: "GR007",
    category: "Diagram Standards",
    rule: "All diagrams must be expandable with proper font sizes for readability",
    implementation: "Fonts neither too big nor too small; explanations and definitions visible within diagram",
    commit: "Reference commit 5ae3c96"
  },
  {
    id: "GR008",
    category: "Code Handling",
    rule: "One-click copy, never show raw output, mention code type (YAML, etc.)",
    implementation: "Provide upload/download options; make code readable and accessible",
    commit: "Reference commit 2d0086a"
  },
  {
    id: "GR009",
    category: "Routing Behavior",
    rule: "Display spiritual content during free API key search and response time",
    implementation: "Show spiritual elements from previous commits; disappear once answer comes",
    commit: "Reference commit add857d"
  },
  {
    id: "GR010",
    category: "Technical Standards",
    rule: "Everything must be 100% accurate with proper source links",
    implementation: "Production grade quality; technical accuracy is mandatory",
    commit: "Reference commit b6c2496"
  }
];

// Session naming based on chat content analysis
export function generateRelevantSessionName(topics: string[], purpose?: string): string {
  const topicKeywords = topics.join(" ").toLowerCase();

  // Topic-based naming patterns
  if (topicKeywords.includes("debug") || topicKeywords.includes("error") || topicKeywords.includes("fix")) {
    return `Debugging ${topics[0] || "Session"}`;
  }
  if (topicKeywords.includes("learn") || topicKeywords.includes("understand") || topicKeywords.includes("explain")) {
    return `Learning ${topics[0] || "Concepts"}`;
  }
  if (topicKeywords.includes("implement") || topicKeywords.includes("build") || topicKeywords.includes("create")) {
    return `Building ${topics[0] || "Feature"}`;
  }
  if (topicKeywords.includes("troubleshoot") || topicKeywords.includes("problem") || topicKeywords.includes("issue")) {
    return `Troubleshooting ${topics[0] || "Issue"}`;
  }

  // Default meaningful names
  const adjectives = ["Focused", "Deep", "Strategic", "Practical", "Technical"];
  const nouns = ["Exploration", "Analysis", "Discussion", "Investigation", "Review"];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj} ${noun}`;
}

// User progress tracking
export interface UserProgress {
  topics: Map<string, TopicProgress>;
  strengths: string[];
  weaknesses: string[];
  sessionHistory: SessionRecord[];
}

export interface TopicProgress {
  topic: string;
  attempts: number;
  successes: number;
  confusionPoints: string[];
  masteredConcepts: string[];
}

export interface SessionRecord {
  sessionId: string;
  topics: string[];
  duration: number;
  keyInsights: string[];
  areasImproved: string[];
}

// Spiritual elements for routing display
export const SPIRITUAL_ELEMENTS = [
  "🌟 The universe aligns your path to the perfect API response...",
  "✨ In the cosmic dance of data, your request finds its destined model...",
  "🌙 Like stars guiding sailors, your free API keys light the way...",
  "🔮 The ancient algorithms whisper their secrets to those who seek...",
  "☯️ Balance between speed and accuracy comes to those who wait...",
  "🧘 In patience, we find the optimal route through the digital cosmos...",
  "🌊 Flow with the current of free-tier possibilities...",
  "🎭 The masks of providers fall away, revealing the true path..."
];