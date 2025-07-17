import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from "@angular/router";
import { PlayersService } from "../../../services/generated/api/players.service";
import { ApiPlayersGet200Response } from "../../../services/generated/model/apiPlayersGet200Response";
import { ApiPlayersGet200ResponsePlayersInner } from "../../../services/generated/model/apiPlayersGet200ResponsePlayersInner";

// Extended interface to handle the API response with players array
interface PlayersResponse extends ApiPlayersGet200Response {
  players?: ApiPlayersGet200ResponsePlayersInner[];
}

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

  // Platform detection for keyboard shortcuts
  public isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Get the appropriate modifier key display text for UI
  get modifierKeyText(): string {
    return this.isMac ? '⌘' : 'Ctrl';
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Prevent shortcuts when typing in form fields
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Check for the appropriate modifier key based on platform (Cmd for Mac, Ctrl for others)
    const modifierKeyPressed = this.isMac ? event.metaKey : event.ctrlKey;

    // Create new player (Cmd+E on Mac, Ctrl+E on Windows/Linux)
    if (modifierKeyPressed && event.key === 'e') {
      event.preventDefault();
      this.createNewPlayer();
    }

    // Back to admin (Escape key)
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

  // Navigation methods
  createNewPlayer(): void {
    this.router.navigate(['/admin/players/new']);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.isLoading = true;
    this.playersService.apiPlayersGet().subscribe({
      next: (response: PlayersResponse) => {
        if (response && response.players) {
          this.players = response.players;
        } else {
          this.players = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.isLoading = false;
      }
    });
  }
}
