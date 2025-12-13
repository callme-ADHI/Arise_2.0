
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface LevelInfo {
    level: number;
    rank: Rank;
    rankTitle: string;
    nextLevelXp: number;
    currentLevelXp: number; // XP acquired within this level
    progress: number; // 0-100%
}

// Hierarchy Definitions
const RANKS: { min: number; max: number; rank: Rank; title: string }[] = [
    { min: 1, max: 49, rank: 'E', title: 'The Awakened' },
    { min: 50, max: 149, rank: 'D', title: 'Striker' },
    { min: 150, max: 299, rank: 'C', title: 'Elite' },
    { min: 300, max: 499, rank: 'B', title: 'Authority' },
    { min: 500, max: 899, rank: 'A', title: 'Monarch' },
    { min: 900, max: 1000, rank: 'S', title: 'Sovereign' }, // Cap at 1000
];

// XP Curve:  XP = Level * 100 (Linear-ish scaling per level to keep it simple but scaling)
// Or better: Base 1000 XP per level? 
// User wants 1-1000. 
// Let's say Level 2 needs 100 XP total. Level 3 needs 200...
// checkLevel(xp) -> returns level.

export const BASE_XP_PER_LEVEL = 100;

export function calculateLevelInfo(totalXp: number): LevelInfo {
    // Simple formula: Level = floor(totalXp / 100) + 1
    // This means level 1 is 0-99 XP. Level 2 is 100-199 XP. 
    // Level 1000 = 99,900 XP.
    // This is easy to understand.

    let level = Math.floor(totalXp / BASE_XP_PER_LEVEL) + 1;
    if (level > 1000) level = 1000;

    const rankInfo = RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

    const currentLevelStart = (level - 1) * BASE_XP_PER_LEVEL;
    const nextLevelStart = level * BASE_XP_PER_LEVEL;
    const currentLevelXp = totalXp - currentLevelStart;
    const progress = Math.min(100, Math.round((currentLevelXp / BASE_XP_PER_LEVEL) * 100));

    return {
        level,
        rank: rankInfo.rank,
        rankTitle: rankInfo.title,
        nextLevelXp: nextLevelStart,
        currentLevelXp,
        progress
    };
}

export const XP_REWARDS = {
    TASK_COMPLETION: 50,
    HABIT_COMPLETION: 30,
    FOCUS_MINUTE: 10, // Per minute? Maybe too high. 30 mins = 300 XP (3 levels).
    // Let's adjust: 1 XP per minute. 30 mins = 30 XP.
    // Actually, Focus is hard. Let's give 2 XP per minute. 30 mins = 60 XP.
    JOURNAL_ENTRY: 20
};
