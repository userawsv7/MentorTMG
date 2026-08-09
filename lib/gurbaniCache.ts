/**
 * Gurbani Cache System for Wait Time Spiritual Display
 * Cycles through Guru Granth Sahib verses during AI processing
 * Format: Gurmukhi → Roman Transliteration → English Meaning
 */

// Type definitions
export interface GurbaniVerse {
  id: number;
  ang: number; // Page number in Guru Granth Sahib
  section: string; // Japji Sahib, etc.
  gurmukhi: string;
  transliteration: string;
  meaning: string;
}

// Initial cache with first 7 Japji Sahib verses (book order)
export const INITIAL_GURBANI_CACHE: GurbaniVerse[] = [
  {
    id: 1,
    ang: 1,
    section: "Japji Sahib - Mool Mantar",
    gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    transliteration: "Ik Onkar Sat Naam Karta Purakh Nirbhao Nirvair Akaal Moorat Ajooni Saibhan Gur Prasad",
    meaning: "One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace"
  },
  {
    id: 2,
    ang: 1,
    section: "Japji Sahib - Pauri 1",
    gurmukhi: "ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥",
    transliteration: "Sochai soch na hovai je sochi lakh vaar",
    meaning: "By thinking, He cannot be reduced to thought, even by thinking hundreds of thousands of times"
  },
  {
    id: 3,
    ang: 2,
    section: "Japji Sahib - Pauri 2",
    gurmukhi: "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
    transliteration: "Hukmi hovan aakaar hukam na kahiaa jaaee",
    meaning: "By His Command, bodies are created; His Command cannot be described"
  },
  {
    id: 4,
    ang: 2,
    section: "Japji Sahib - Pauri 3",
    gurmukhi: "ਗਾਵੈ ਕੋ ਤਾਣੁ ਨਾਵੈ ਕੋ ਚਾਉ ॥",
    transliteration: "Gaavai ko taan naavai ko chao",
    meaning: "Some sing of His Power - who has that power? Some sing of His Gifts, they know His Blessings"
  },
  {
    id: 5,
    ang: 2,
    section: "Japji Sahib - Pauri 4",
    gurmukhi: "ਸਾਚਾ ਸਾਹਿਬੁ ਸਾਚੁ ਨਾਇ ਭਾਖਿਆ ਭਾਉ ਅਪਾਰੁ ॥",
    transliteration: "Saachaa saahib saach naa-ay bhaakhiaa bhaa-o apaar",
    meaning: "True is the Master, True is His Name; Speak and praise Him, He is the Greatest of the Great"
  },
  {
    id: 6,
    ang: 3,
    section: "Japji Sahib - Pauri 5",
    gurmukhi: "ਤਿਥੈ ਤੋਨ ਨ ਤੋਵੈ ਤਾਕੁ ॥",
    transliteration: "Tithai ton na tovai taak",
    meaning: "There, the weak are sustained forever"
  },
  {
    id: 7,
    ang: 3,
    section: "Japji Sahib - Pauri 6",
    gurmukhi: "ਤਿਥੈ ਖੰਡ ਮੰਡਲ ਵਰਭੰਡ ॥",
    transliteration: "Tithai khand mandal varbhand",
    meaning: "There are planets, solar systems and galaxies"
  }
];

// Cache class for managing verses
export class GurbaniCache {
  private cache: GurbaniVerse[] = [...INITIAL_GURBANI_CACHE];
  private currentIndex: number = 0;
  private cycleCount: number = 0;
  private lastFetchTime: Date = new Date();

  // Get next verse in sequence
  getNextVerse(): GurbaniVerse {
    const verse = this.cache[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.cache.length;

    // Track cycles
    if (this.currentIndex === 0) {
      this.cycleCount++;
    }

    return verse;
  }

  // Get current verse without advancing
  getCurrentVerse(): GurbaniVerse {
    return this.cache[this.currentIndex];
  }

  // Add new verses to cache (for future API integration)
  addVerses(newVerses: GurbaniVerse[]): void {
    this.cache.push(...newVerses);
  }

  // Get cache statistics
  getStats(): { totalVerses: number; currentCycle: number; lastUpdated: Date } {
    return {
      totalVerses: this.cache.length,
      currentCycle: this.cycleCount,
      lastUpdated: this.lastFetchTime
    };
  }

  // Reset to beginning
  reset(): void {
    this.currentIndex = 0;
    this.cycleCount = 0;
  }
}

// Export singleton instance
export const gurbaniCache = new GurbaniCache();

// Future API integration placeholder
export async function fetchNextGurbaniBatch(): Promise<GurbaniVerse[]> {
  // Placeholder for future API integration
  // Would fetch from free sources like:
  // - SikhNet Gurbani JSON API
  // - GurbaniNow API
  // - Local cache expansion

  // For now, return empty array until API keys configured
  return [];
}

// Display format helper
export function formatGurbaniForDisplay(verse: GurbaniVerse): string {
  return `
┌─────────────────────────────────────────────────────────────┐
│  ${verse.section} (Ang ${verse.ang})
├─────────────────────────────────────────────────────────────┤
│  ${verse.gurmukhi}
│
│  📖 ${verse.transliteration}
│
│  💭 ${verse.meaning}
└─────────────────────────────────────────────────────────────┘
`.trim();
}