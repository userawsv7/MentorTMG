import { generateRelevantSessionName } from './generalRules';

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

/**
 * Generate session name based on actual chat content and topics discussed.
 * This follows General Rule GR005: Provide relevant session names as per chat session.
 * @param topics - Array of topics discussed in the session
 * @param purpose - Optional purpose context
 * @param existingNames - Names already in use
 */
export function generateContentBasedSessionName(
  topics: string[],
  purpose?: string,
  existingNames: string[] = []
): string {
  // Try content-based naming first
  const contentBasedName = generateRelevantSessionName(topics, purpose);
  if (!existingNames.includes(contentBasedName)) {
    return contentBasedName;
  }

  // Fall back to original naming if conflict
  return generateSessionName(existingNames);
}
