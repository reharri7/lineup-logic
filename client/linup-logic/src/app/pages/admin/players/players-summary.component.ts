import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from "@angular/router";
import { PlayersService } from "../../../services/generated";
import { ApiPlayersGet200ResponsePlayersInner } from "../../../services/generated";
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-players-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './players-summary.component.html',
  styleUrl: './players-summary.component.css'
})
export class PlayersSummaryComponent implements OnInit {
  players: ApiPlayersGet200ResponsePlayersInner[] = [];
  isLoading = false;

  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 25;

  getUpperBoundOfDisplayedEntries(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

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
    await this.loadPlayers();
  }

  async loadPlayers() {
    this.isLoading = true;
    try {
      const result = await lastValueFrom(this.playersService.apiPlayersGet(this.currentPage, this.pageSize));
      if (!!result && !!result.players) {
        this.players = result.players;

        if (result.meta) {
          this.currentPage = result.meta.current_page!;
          this.totalPages = result.meta.total_pages!;
          this.totalCount = result.meta.total_count!;
          this.pageSize = result.meta.size!;
        }
      } else {
        this.players = [];
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      this.isLoading = false;
    }

  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPlayers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPlayers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPlayers();
    }
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadPlayers();
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadPlayers();
    }
  }
}
