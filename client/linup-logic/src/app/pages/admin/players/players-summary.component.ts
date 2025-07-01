import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
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

  constructor(
    private playersService: PlayersService,
  ) {
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
