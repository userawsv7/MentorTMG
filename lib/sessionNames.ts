const ADJECTIVES = [
  "Curious", "Quiet", "Bright", "Steady", "Swift", "Calm", "Bold", "Gentle",
  "Sharp", "Warm", "Clever", "Vivid", "Quick", "Patient", "Keen", "Sunny",
  "Cool", "Brave", "Tidy", "Lively",
];

const NOUNS = [
  "Falcon", "Comet", "Harbor", "Maple", "Ridge", "Lantern", "Otter", "Meadow",
  "Compass", "Ember", "Willow", "Beacon", "Cedar", "Sparrow", "Canyon", "Delta",
  "Orchard", "Pebble", "Horizon", "Juniper",
];

/** Deterministic-feeling but varied human name, e.g. "Curious Falcon". */
export function generateSessionName(existingNames: string[] = []): string {
  const used = new Set(existingNames);
  for (let attempt = 0; attempt < 40; attempt++) {
    const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const name = `${a} ${n}`;
    if (!used.has(name)) return name;
  }
  return `Session ${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Session Tracking Types
export interface SessionMetrics {
  topics: string[];
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  questionsAsked: number;
  diagramsViewed: number;
  codeBlocksCopied: number;
}

export interface SessionProfile {
  sessionId: string;
  sessionName: string;
  startTime: string;
  lastActivity: string;
  metrics: SessionMetrics;
  topicHistory: Array<{
    topic: string;
    timestamp: string;
    type: 'troubleshooting' | 'learning' | 'general';
  }>;
}

// In-memory session storage (would use proper storage in production)
const sessionProfiles = new Map<string, SessionProfile>();

/** Initialize a new session profile */
export function initializeSessionProfile(sessionId: string, sessionName: string): SessionProfile {
  const profile: SessionProfile = {
    sessionId,
    sessionName,
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    metrics: {
      topics: [],
      strengths: [],
      weaknesses: [],
      improvementAreas: [],
      questionsAsked: 0,
      diagramsViewed: 0,
      codeBlocksCopied: 0,
    },
    topicHistory: [],
  };
  sessionProfiles.set(sessionId, profile);
  return profile;
}

/** Record a topic interaction in the session */
export function recordTopicInteraction(
  sessionId: string,
  topic: string,
  type: 'troubleshooting' | 'learning' | 'general',
  observations?: {
    strength?: string;
    weakness?: string;
    improvement?: string;
  }
): void {
  const profile = sessionProfiles.get(sessionId);
  if (!profile) return;

  profile.lastActivity = new Date().toISOString();

  // Add to topics if new
  if (!profile.metrics.topics.includes(topic)) {
    profile.metrics.topics.push(topic);
  }

  // Add to history
  profile.topicHistory.push({
    topic,
    timestamp: new Date().toISOString(),
    type,
  });

  // Record observations
  if (observations?.strength && !profile.metrics.strengths.includes(observations.strength)) {
    profile.metrics.strengths.push(observations.strength);
  }
  if (observations?.weakness && !profile.metrics.weaknesses.includes(observations.weakness)) {
    profile.metrics.weaknesses.push(observations.weakness);
  }
  if (observations?.improvement && !profile.metrics.improvementAreas.includes(observations.improvement)) {
    profile.metrics.improvementAreas.push(observations.improvement);
  }
}

/** Update session metrics */
export function updateSessionMetric(
  sessionId: string,
  metric: keyof SessionMetrics,
  value: number | string
): void {
  const profile = sessionProfiles.get(sessionId);
  if (!profile) return;

  profile.lastActivity = new Date().toISOString();

  if (typeof value === 'number') {
    if (metric === 'questionsAsked' || metric === 'diagramsViewed' || metric === 'codeBlocksCopied') {
      (profile.metrics as any)[metric] = ((profile.metrics as any)[metric] || 0) + value;
    }
  } else if (typeof value === 'string') {
    const currentArray = (profile.metrics as any)[metric] as string[];
    if (currentArray && !currentArray.includes(value)) {
      currentArray.push(value);
    }
  }
}

/** Get session profile */
export function getSessionProfile(sessionId: string): SessionProfile | undefined {
  return sessionProfiles.get(sessionId);
}

/** Generate session summary */
export function generateSessionSummary(sessionId: string): string {
  const profile = sessionProfiles.get(sessionId);
  if (!profile) return "No session data available.";

  const duration = Math.round(
    (new Date(profile.lastActivity).getTime() - new Date(profile.startTime).getTime()) / 60000
  );

  return `
Session: ${profile.sessionName}
Duration: ${duration} minutes
Topics Covered: ${profile.metrics.topics.length}
Questions Asked: ${profile.metrics.questionsAsked}
Diagrams Viewed: ${profile.metrics.diagramsViewed}

Strengths Demonstrated:
${profile.metrics.strengths.length > 0 ? profile.metrics.strengths.map(s => `- ${s}`).join('\n') : '- None recorded'}

Areas for Improvement:
${profile.metrics.improvementAreas.length > 0 ? profile.metrics.improvementAreas.map(a => `- ${a}`).join('\n') : '- None identified'}

Weaknesses Observed:
${profile.metrics.weaknesses.length > 0 ? profile.metrics.weaknesses.map(w => `- ${w}`).join('\n') : '- None observed'}
  `.trim();
}
