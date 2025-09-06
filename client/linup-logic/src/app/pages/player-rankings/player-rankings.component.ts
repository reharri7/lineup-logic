import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  // Selection persistence helpers
  selectedPlayerIds: number[] = [];
  lastSavedIds: number[] = [];
  private playerCache: Map<number, any> = new Map<number, any>();
  private saveDebounceHandle: any = null;

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
          this.teams = (response.teams || [])
            .slice()
            .sort((a: any, b: any) => (a?.name ?? '').localeCompare(b?.name ?? '', undefined, { sensitivity: 'base' }));
          this.loadingTeams = false;
        },
        error: (err) => {
          console.error('Error loading teams:', err);
          this.loadingTeams = false;
        }
      });
  }

  onPositionChange(): void {
    // Reset pagination and lists
    this.currentPage = 1;
    this.availablePlayers = [];
    this.selectedPlayers = [];
    this.disconnectObserver();

    // Load saved IDs for the selected position
    if (this.selectedPosition) {
      this.selectedPlayerIds = this.playerRankingsService.getRankings(this.selectedPosition) || [];
      this.lastSavedIds = [...this.selectedPlayerIds];
      // Attempt to populate selectedPlayers based on saved IDs
      this.buildSelectedPlayersFromIds();
      // Load first page of available players
      this.loadPlayersByPosition(false);
    }
  }

  loadPlayersByPosition(loadMore: boolean = false): void {
    if (!this.selectedPosition) return;

    if (loadMore) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
      if (this.currentPage === 1) {
        // When not loading more and starting fresh, clear available list and observer
        this.availablePlayers = [];
        this.disconnectObserver();
      }
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
        const newPlayers = response.players || [];

        // Update pagination metadata
        if (response.meta) {
          this.totalPages = response.meta.total_pages || 0;
        }

        // Build a set from selectedPlayerIds to filter available players
        const selectedIdSet = new Set(this.selectedPlayerIds);

        // Filter out already selected players from the new batch
        const newAvailablePlayers = newPlayers.filter(p => !selectedIdSet.has(p.id || 0));

        if (loadMore) {
          // Append new players to existing list
          this.availablePlayers = [...this.availablePlayers, ...newAvailablePlayers];
          this.isLoadingMore = false;
        } else {
          // Replace available players list on fresh load
          this.availablePlayers = newAvailablePlayers;
          this.loading = false;
        }

        // Cache any newly loaded selected players (for when they appear in paging)
        newPlayers.forEach(p => {
          if (p && p.id != null) {
            this.playerCache.set(p.id, p);
          }
        });

        // Ensure selectedPlayers are in correct order based on selectedPlayerIds and cache
        this.rebuildSelectedPlayersFromCache();

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

  private buildSelectedPlayersFromIds(): void {
    const ids = this.selectedPlayerIds || [];
    if (ids.length === 0) {
      this.selectedPlayers = [];
      this.lastSavedIds = [];
      return;
    }

    // Use cache for existing, collect missing
    const missingIds: number[] = [];
    const initialSelected: any[] = [];
    ids.forEach(id => {
      const cached = this.playerCache.get(id);
      if (cached) {
        initialSelected.push(cached);
      } else {
        missingIds.push(id);
      }
    });
    this.selectedPlayers = initialSelected;

    if (missingIds.length === 0) {
      this.lastSavedIds = [...ids];
      return;
    }

    const requests = missingIds.map(id =>
      this.playersService.apiPlayersIdGet(id).pipe(
        catchError(err => {
          console.warn('Failed to load player by ID', id, err);
          return of(null as any);
        })
      )
    );

    forkJoin(requests).subscribe(results => {
      let removedAny = false;
      results.forEach((res: any, idx: number) => {
        const id = missingIds[idx];
        const player = res && res.player ? res.player : null;
        if (player && player.id != null) {
          this.playerCache.set(id, player);
        } else {
          // Remove ID that no longer exists
          this.selectedPlayerIds = this.selectedPlayerIds.filter(pid => pid !== id);
          removedAny = true;
        }
      });

      this.rebuildSelectedPlayersFromCache();

      if (removedAny) {
        // Persist corrected list once
        this.doSaveRankings();
      } else {
        this.lastSavedIds = [...this.selectedPlayerIds];
      }
    });
  }

  private rebuildSelectedPlayersFromCache(): void {
    const list: any[] = [];
    this.selectedPlayerIds.forEach(id => {
      const player = this.playerCache.get(id);
      if (player) list.push(player);
    });
    this.selectedPlayers = list;
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
    // Reflect new order in IDs and schedule save
    this.selectedPlayerIds = this.selectedPlayers.map(p => p.id).filter((id): id is number => id != null);
    this.scheduleSave();
  }

  movePlayerUp(index: number): void {
    if (index > 0) {
      // Swap with the player above
      [this.selectedPlayers[index - 1], this.selectedPlayers[index]] =
        [this.selectedPlayers[index], this.selectedPlayers[index - 1]];

      // Reflect new order in IDs and schedule save
      this.selectedPlayerIds = this.selectedPlayers.map(p => p.id).filter((id): id is number => id != null);
      this.scheduleSave();
    }
  }

  movePlayerDown(index: number): void {
    if (index < this.selectedPlayers.length - 1) {
      [this.selectedPlayers[index], this.selectedPlayers[index + 1]] =
        [this.selectedPlayers[index + 1], this.selectedPlayers[index]];

      // Reflect new order in IDs and schedule save
      this.selectedPlayerIds = this.selectedPlayers.map(p => p.id).filter((id): id is number => id != null);
      this.scheduleSave();
    }
  }

  saveRankings(): void {
    // Kept for compatibility; internally uses debounced change-detected save
    this.scheduleSave();
  }

  private scheduleSave(delay: number = 200): void {
    if (!this.selectedPosition) return;
    // Change detection
    const current = this.selectedPlayerIds;
    const changed = current.length !== this.lastSavedIds.length || current.some((id, i) => id !== this.lastSavedIds[i]);
    if (!changed) return;

    // Debounce
    if (this.saveDebounceHandle) {
      clearTimeout(this.saveDebounceHandle);
    }
    this.saveDebounceHandle = setTimeout(() => this.doSaveRankings(), delay);
  }

  private doSaveRankings(): void {
    if (!this.selectedPosition) return;
    const ids = this.selectedPlayerIds;
    this.playerRankingsService.saveRankings(this.selectedPosition, ids);
    this.lastSavedIds = [...ids];
  }

  addPlayerToRankings(player: any): void {
    const index = this.availablePlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.availablePlayers.splice(index, 1);
      this.selectedPlayers.push(player);
      if (player && player.id != null) {
        this.selectedPlayerIds.push(player.id);
      }
      this.scheduleSave();
    }
  }

  removePlayerFromRankings(player: any): void {
    const index = this.selectedPlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.selectedPlayers.splice(index, 1);
      this.availablePlayers.push(player);
      // Remove from IDs
      this.selectedPlayerIds = this.selectedPlayerIds.filter(id => id !== player.id);
      this.scheduleSave();
    }
  }

  clearCurrentRankings(): void {
    if (!this.selectedPosition) return;

    this.playerRankingsService.clearRankings(this.selectedPosition);

    this.availablePlayers = [...this.availablePlayers, ...this.selectedPlayers];
    this.selectedPlayers = [];
    this.selectedPlayerIds = [];
    this.lastSavedIds = [];
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
        // Sync IDs from storage and rebuild selected list
        this.selectedPlayerIds = this.playerRankingsService.getRankings(this.selectedPosition) || [];
        this.lastSavedIds = [...this.selectedPlayerIds];
        this.buildSelectedPlayersFromIds();
        // Refresh available players for current filters/page (reset to first page)
        this.currentPage = 1;
        this.loadPlayersByPosition(false);
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
