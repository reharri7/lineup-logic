import { Injectable } from '@angular/core';
import { PlayerRankingsService } from './player-rankings.service';

interface Player {
  id: number;
  name: string;
  position: {
    id: number;
    position_name: string;
  };
  team: {
    id: number;
    name: string;
  };
}

export interface OptimalLineup {
  quarterback: Player | null;
  runningBacks: Player[];
  wideReceivers: Player[];
  tightEnd: Player | null;
  flex: Player | null;
  kicker: Player | null;
  defense: Player | null;
}

@Injectable({
  providedIn: 'root'
})
export class LineupOptimizerService {

  constructor(private playerRankingsService: PlayerRankingsService) {}

  /**
   * Generate an optimal lineup based on player rankings
   * @param teamPlayers Array of players on the fantasy team
   * @returns Optimal lineup
   */
  generateOptimalLineup(teamPlayers: Player[]): OptimalLineup {
    const lineup: OptimalLineup = {
      quarterback: null,
      runningBacks: [],
      wideReceivers: [],
      tightEnd: null,
      flex: null,
      kicker: null,
      defense: null
    };

    if (!teamPlayers || teamPlayers.length === 0) {
      return lineup;
    }

    const qbRankings = this.playerRankingsService.getRankings('QB');
    const rbRankings = this.playerRankingsService.getRankings('RB');
    const wrRankings = this.playerRankingsService.getRankings('WR');
    const teRankings = this.playerRankingsService.getRankings('TE');
    const kRankings = this.playerRankingsService.getRankings('K');
    const defRankings = this.playerRankingsService.getRankings('DEF');
    const flexRankings = this.playerRankingsService.getRankings('FLEX');

    // Group players by position
    const qbs = teamPlayers.filter(p => p.position.position_name === 'QB');
    const rbs = teamPlayers.filter(p => p.position.position_name === 'RB');
    const wrs = teamPlayers.filter(p => p.position.position_name === 'WR');
    const tes = teamPlayers.filter(p => p.position.position_name === 'TE');
    const ks = teamPlayers.filter(p => p.position.position_name === 'K');
    const defs = teamPlayers.filter(p => p.position.position_name === 'DEF');

    // Sort players by their rankings
    this.sortPlayersByRanking(qbs, qbRankings);
    this.sortPlayersByRanking(rbs, rbRankings);
    this.sortPlayersByRanking(wrs, wrRankings);
    this.sortPlayersByRanking(tes, teRankings);
    this.sortPlayersByRanking(ks, kRankings);
    this.sortPlayersByRanking(defs, defRankings);


    // 1. Quarterback (1)
    if (qbs.length > 0) {
      lineup.quarterback = qbs[0];
    }

    // 2. Running Backs (2)
    lineup.runningBacks = rbs.slice(0, 2);

    // 3. Wide Receivers (2)
    lineup.wideReceivers = wrs.slice(0, 2);

    // 4. Tight End (1)
    if (tes.length > 0) {
      lineup.tightEnd = tes[0];
    }

    // 5. Kicker (1)
    if (ks.length > 0) {
      lineup.kicker = ks[0];
    }

    // 6. Defense (1)
    if (defs.length > 0) {
      lineup.defense = defs[0];
    }

    // 7. Flex (1) - Best remaining RB, WR, or TE
    const flexCandidates: Player[] = [
      ...rbs.slice(2), // RBs not already in lineup
      ...wrs.slice(2), // WRs not already in lineup
      ...tes.slice(1)  // TEs not already in lineup
    ];

    // Sort flex candidates by flex rankings
    this.sortPlayersByRanking(flexCandidates, flexRankings);

    if (flexCandidates.length > 0) {
      lineup.flex = flexCandidates[0];
    }

    return lineup;
  }

  /**
   * Sort players based on their rankings
   * @param players Array of players to sort
   * @param rankings Array of player IDs in ranked order
   */
  private sortPlayersByRanking(players: Player[], rankings: number[]): void {
    const rankMap = new Map<number, number>();
    rankings.forEach((id, index) => {
      rankMap.set(id, index);
    });

    players.sort((a, b) => {
      const rankA = rankMap.has(a.id) ? rankMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const rankB = rankMap.has(b.id) ? rankMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    });
  }
}
