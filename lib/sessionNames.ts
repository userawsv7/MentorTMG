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
