import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerRankingsService {
  private STORAGE_KEY_PREFIX = 'player_rankings_';

  constructor() {}

  /**
   * Save rankings for a specific position
   * @param positionCode Position code (e.g., 'QB', 'RB', 'WR', etc.)
   * @param rankings Array of player IDs in ranked order
   */
  saveRankings(positionCode: string, rankings: number[]): void {
    localStorage.setItem(
      this.STORAGE_KEY_PREFIX + positionCode,
      JSON.stringify(rankings)
    );
  }

  /**
   * Get rankings for a specific position
   * @param positionCode Position code (e.g., 'QB', 'RB', 'WR', etc.)
   * @returns Array of player IDs in ranked order, or empty array if no rankings exist
   */
  getRankings(positionCode: string): number[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_PREFIX + positionCode);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Check if rankings exist for a specific position
   * @param positionCode Position code (e.g., 'QB', 'RB', 'WR', etc.)
   * @returns True if rankings exist, false otherwise
   */
  hasRankings(positionCode: string): boolean {
    return localStorage.getItem(this.STORAGE_KEY_PREFIX + positionCode) !== null;
  }

  /**
   * Clear rankings for a specific position
   * @param positionCode Position code (e.g., 'QB', 'RB', 'WR', etc.)
   */
  clearRankings(positionCode: string): void {
    localStorage.removeItem(this.STORAGE_KEY_PREFIX + positionCode);
  }

  /**
   * Clear all rankings
   */
  clearAllRankings(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * Export all rankings as a JSON string
   * @returns JSON string containing all rankings
   */
  exportRankings(): string {
    const rankings: Record<string, number[]> = {};

    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
      .forEach(key => {
        const positionCode = key.replace(this.STORAGE_KEY_PREFIX, '');
        rankings[positionCode] = this.getRankings(positionCode);
      });

    return JSON.stringify(rankings);
  }

  /**
   * Import rankings from a JSON string
   * @param json JSON string containing rankings
   * @returns True if import was successful, false otherwise
   */
  importRankings(json: string): boolean {
    try {
      const rankings = JSON.parse(json) as Record<string, number[]>;

      Object.entries(rankings).forEach(([positionCode, playerIds]) => {
        this.saveRankings(positionCode, playerIds);
      });

      return true;
    } catch (e) {
      console.error('Failed to import rankings:', e);
      return false;
    }
  }
}
