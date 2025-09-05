import { Component, OnInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from "@angular/router";
import { PlayersService, TeamsService, PositionsService } from "../../../services/generated";
import { ApiPlayersGet200ResponsePlayersInner } from "../../../services/generated";
import { lastValueFrom } from "rxjs";
import { SelectComponent } from "../../../components/select/select.component";

@Component({
  selector: 'app-players-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SelectComponent],
  templateUrl: './players-summary.component.html',
  styleUrl: './players-summary.component.css'
})
export class PlayersSummaryComponent implements OnInit {
  players = signal<ApiPlayersGet200ResponsePlayersInner[]>([]);
  isLoading = signal<boolean>(false);

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalCount = signal<number>(0);
  pageSize = signal<number>(25);

  sortBy = signal<string>('name');
  sortDirection = signal<string>('asc');

  nameFilter = signal<string>('');
  numberFilter = signal<number | null>(null);
  teamId = signal<number | null>(null);
  positionId = signal<number | null>(null);

  // Reactive form controls for filters
  teamCtrl = new FormControl<number | null>(null);
  positionCtrl = new FormControl<number | null>(null);

  teams = signal<any[]>([]);
  positions = signal<any[]>([]);

  filters = computed(() => ({
    nameFilter: this.nameFilter(),
    numberFilter: this.numberFilter(),
    teamId: this.teamId(),
    positionId: this.positionId()
  }));

  upperBoundOfDisplayedEntries = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  });

  public isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  get modifierKeyText(): string {
    return this.isMac ? '⌘' : 'Ctrl';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement) {
      return;
    }

    const modifierKeyPressed = this.isMac ? event.metaKey : event.ctrlKey;

    if (modifierKeyPressed && event.key === 'e') {
      event.preventDefault();
      this.createNewPlayer();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.goBack();
    }
  }

  constructor(
    private playersService: PlayersService,
    private teamsService: TeamsService,
    private positionsService: PositionsService,
    private router: Router,
  ) {
  }

  createNewPlayer(): void {
    this.router.navigate(['/admin/players/new']);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  async ngOnInit(): Promise<void> {
    this.teamCtrl.setValue(this.teamId(), { emitEvent: false });
    this.positionCtrl.setValue(this.positionId(), { emitEvent: false });

    this.teamCtrl.valueChanges.subscribe(v => this.teamId.set(v ?? null));
    this.positionCtrl.valueChanges.subscribe(v => this.positionId.set(v ?? null));

    await this.loadTeamsAndPositions();
    await this.loadPlayers();
  }

  async loadTeamsAndPositions() {
    try {
      const teamsResult = await lastValueFrom(this.teamsService.apiTeamsGet());
      if (teamsResult && teamsResult.teams) {
        this.teams.set(teamsResult.teams);
      }

      const positionsResult = await lastValueFrom(this.positionsService.apiPositionsGet());
      if (positionsResult && positionsResult.positions) {
        this.positions.set(positionsResult.positions);
      }
    } catch (error) {
      console.error('Error loading teams or positions:', error);
    }
  }

  async loadPlayers() {
    this.isLoading.set(true);
    try {
      const filtersValue = this.filters();
      const result = await lastValueFrom(this.playersService.apiPlayersGet(
        this.currentPage(),
        this.pageSize(),
        filtersValue.nameFilter || undefined,
        filtersValue.numberFilter || undefined,
        filtersValue.teamId || undefined,
        filtersValue.positionId || undefined,
        this.sortBy(),
        this.sortDirection()
      ));

      if (!!result && !!result.players) {
        this.players.set(result.players);

        if (result.meta) {
          this.currentPage.set(result.meta.current_page!);
          this.totalPages.set(result.meta.total_pages!);
          this.totalCount.set(result.meta.total_count!);
          this.pageSize.set(result.meta.size!);
        }
      } else {
        this.players.set([]);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  sortTable(column: string): void {
    if (this.sortBy() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('asc');
    }

    this.currentPage.set(1);
    this.loadPlayers();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadPlayers();
  }

  clearFilters(): void {
    this.nameFilter.set('');
    this.numberFilter.set(null);
    this.teamId.set(null);
    this.positionId.set(null);

    this.teamCtrl.setValue(null, { emitEvent: false });
    this.positionCtrl.setValue(null, { emitEvent: false });

    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadPlayers();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadPlayers();
    }
  }

  goToFirstPage(): void {
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
      this.loadPlayers();
    }
  }

  goToLastPage(): void {
    if (this.currentPage() !== this.totalPages()) {
      this.currentPage.set(this.totalPages());
      this.loadPlayers();
    }
  }

  onNameFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nameFilter.set(input.value);
  }

  onNumberFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.numberFilter.set(input.value ? +input.value : null);
  }

  onTeamChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.teamId.set(select.value ? +select.value : null);
  }

  onPositionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.positionId.set(select.value ? +select.value : null);
  }
}
