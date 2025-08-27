import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { PlayersService } from 'src/app/services/generated/api/players.service';
import { PositionsService } from 'src/app/services/generated/api/positions.service';
import { TeamsService } from 'src/app/services/generated/api/teams.service';
import { PlayerRankingsService } from 'src/app/shared/services/player-rankings.service';
import { InputComponent } from '../../components/input/input.component';
import { SelectComponent } from '../../components/select/select.component';
import { TextareaComponent } from '../../components/textarea/textarea.component';

@Component({
  selector: 'app-player-rankings',
  templateUrl: './player-rankings.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule, InputComponent, SelectComponent, TextareaComponent]
})
export class PlayerRankingsComponent implements OnInit, AfterViewInit, OnDestroy {
  positions: any[] = [];
  selectedPosition: string = '';
  positionOptions: string[] = [];
  availablePlayers: any[] = [];
  selectedPlayers: any[] = [];
  loading = false;
  error: string | null = null;

  playerNameFilter: string = '';
  selectedTeamId: number | null = null;
  teams: any[] = [];
  loadingTeams = false;

  exportedRankings: string = '';
  importRankings: string = '';
  showExportModal = false;
  showImportModal = false;
  importError: string | null = null;
  importSuccess = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 25;
  totalPages: number = 0;
  isLoadingMore: boolean = false;

  // Intersection Observer
  private observer: IntersectionObserver | null = null;

  constructor(
    private playersService: PlayersService,
    private positionsService: PositionsService,
    private teamsService: TeamsService,
    private playerRankingsService: PlayerRankingsService
  ) {}

  ngOnInit(): void {
    this.loadPositions();
    this.loadTeams();
  }

  ngAfterViewInit(): void {
    // Initial setup will happen after players are loaded
  }

  ngOnDestroy(): void {
    // Clean up the observer when the component is destroyed
    this.disconnectObserver();
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  loadPositions(): void {
    this.positionsService.apiPositionsGet()
      .subscribe({
        next: (response) => {
          this.positions = response.positions || [];
          const names = (this.positions || []).map((p: any) => p.position_name).filter((n: any) => !!n);
          const withFlex = [...names, 'FLEX'];
          this.positionOptions = Array.from(new Set(withFlex));
        },
        error: (err) => {
          this.error = 'Failed to load positions. Please try again.';
          console.error('Error loading positions:', err);
        }
      });
  }

  loadTeams(): void {
    this.loadingTeams = true;

    this.teamsService.apiTeamsGet()
      .subscribe({
        next: (response) => {
          this.teams = response.teams || [];
          this.loadingTeams = false;
        },
        error: (err) => {
          console.error('Error loading teams:', err);
          this.loadingTeams = false;
        }
      });
  }

  onPositionChange(): void {
    this.loadPlayersByPosition();
  }

  loadPlayersByPosition(loadMore: boolean = false): void {
    if (!this.selectedPosition) return;

    if (loadMore) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
      this.currentPage = 1; // Reset to first page when not loading more
      // Disconnect any existing observer when starting a new load
      this.disconnectObserver();
    }

    this.error = null;

    const position = this.positions.find(p => p.position_name === this.selectedPosition);
    const positionId = position?.id;

    this.playersService.apiPlayersGet(
      this.currentPage,
      this.pageSize,
      this.playerNameFilter || undefined,
      undefined,
      this.selectedTeamId || undefined,
      positionId !== undefined ? positionId : undefined
    ).subscribe({
      next: (response) => {
        const savedRankings = this.playerRankingsService.getRankings(this.selectedPosition);
        const newPlayers = response.players || [];

        // Update pagination metadata
        if (response.meta) {
          this.totalPages = response.meta.total_pages || 0;
        }

        const playerMap = new Map(newPlayers.map(p => [p.id, p]));

        // Get all selected player IDs to filter them out from available players
        const selectedPlayerIds = new Set(this.selectedPlayers.map(p => p.id));

        // Filter out already selected players from the new batch
        const newAvailablePlayers = newPlayers.filter(p => !selectedPlayerIds.has(p.id));

        if (loadMore) {
          // Append new players to existing list
          this.availablePlayers = [...this.availablePlayers, ...newAvailablePlayers];
          this.isLoadingMore = false;
        } else {
          // First load - handle selected players
          if (savedRankings.length > 0) {
            this.selectedPlayers = savedRankings
              .filter(id => playerMap.has(id))
              .map(id => playerMap.get(id));

            this.availablePlayers = newAvailablePlayers;
          } else {
            this.availablePlayers = newAvailablePlayers;
            this.selectedPlayers = [];
          }
          this.loading = false;
        }

        // Set up the intersection observer after the data is loaded
        // Use setTimeout to ensure the DOM has been updated
        setTimeout(() => this.setupIntersectionObserver(), 0);
      },
      error: (err) => {
        this.error = 'Failed to load players. Please try again.';
        console.error('Error loading players:', err);
        this.loading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private setupIntersectionObserver(): void {
    // Disconnect any existing observer first
    this.disconnectObserver();

    // Only set up the observer if there are more pages to load
    if (this.currentPage >= this.totalPages) {
      return;
    }

    // Find the sentinel element
    const sentinel = document.getElementById('player-list-sentinel');
    if (!sentinel) {
      console.error('Sentinel element not found');
      return;
    }

    // Create the observer
    this.observer = new IntersectionObserver((entries) => {
      // If the sentinel is visible and we're not already loading more data
      if (entries[0].isIntersecting && !this.isLoadingMore && this.currentPage < this.totalPages) {
        this.loadMorePlayers();
      }
    }, {
      root: document.querySelector('.overflow-y-auto'), // The scrollable container
      threshold: 0.1 // Trigger when at least 10% of the sentinel is visible
    });

    // Start observing the sentinel
    this.observer.observe(sentinel);
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.refreshPlayerLists();
  }

  clearFilters(): void {
    this.playerNameFilter = '';
    this.selectedTeamId = null;
    this.currentPage = 1; // Reset to first page
    this.refreshPlayerLists();
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.selectedPlayers, event.previousIndex, event.currentIndex);
    this.saveRankings();
  }

  movePlayerUp(index: number): void {
    if (index > 0) {
      // Swap with the player above
      [this.selectedPlayers[index - 1], this.selectedPlayers[index]] =
        [this.selectedPlayers[index], this.selectedPlayers[index - 1]];

      // Save the new rankings
      this.saveRankings();
    }
  }

  movePlayerDown(index: number): void {
    if (index < this.selectedPlayers.length - 1) {
      [this.selectedPlayers[index], this.selectedPlayers[index + 1]] =
        [this.selectedPlayers[index + 1], this.selectedPlayers[index]];

      this.saveRankings();
    }
  }

  saveRankings(): void {
    if (!this.selectedPosition) return;

    const playerIds = this.selectedPlayers.map(p => p.id).filter((id): id is number => id !== undefined);
    this.playerRankingsService.saveRankings(this.selectedPosition, playerIds);
  }

  addPlayerToRankings(player: any): void {
    const index = this.availablePlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.availablePlayers.splice(index, 1);
      this.selectedPlayers.push(player);
      this.saveRankings();
    }
  }

  removePlayerFromRankings(player: any): void {
    const index = this.selectedPlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.selectedPlayers.splice(index, 1);
      this.availablePlayers.push(player);
      this.saveRankings();
    }
  }

  clearCurrentRankings(): void {
    if (!this.selectedPosition) return;

    this.playerRankingsService.clearRankings(this.selectedPosition);

    this.availablePlayers = [...this.availablePlayers, ...this.selectedPlayers];
    this.selectedPlayers = [];
  }

  openExportModal(): void {
    this.exportedRankings = this.playerRankingsService.exportRankings();
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.exportedRankings)
      .then(() => {
        // Success
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  openImportModal(): void {
    this.importRankings = '';
    this.importError = null;
    this.importSuccess = false;
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  submitImport(): void {
    this.importError = null;
    this.importSuccess = false;

    if (!this.importRankings) {
      this.importError = 'Please enter rankings to import';
      return;
    }

    const success = this.playerRankingsService.importRankings(this.importRankings);

    if (success) {
      this.importSuccess = true;

      if (this.selectedPosition) {
        this.loadPlayersByPosition();
      }
    } else {
      this.importError = 'Failed to import rankings. Please check the format and try again.';
    }
  }

  refreshPlayerLists(): void {
    if (this.selectedPosition) {
      this.loadPlayersByPosition();
    }
  }

  loadMorePlayers(): void {
    // Only load more if we're not already loading and there are more pages
    if (!this.isLoadingMore && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPlayersByPosition(true);
    }
  }
}
