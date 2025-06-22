import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {TeamsService} from "../../../services/generated/api/teams.service";
import {ApiTeamsPost201Response} from "../../../services/generated/model/apiTeamsPost201Response";
import {ApiTeamsPost201ResponseTeam} from "../../../services/generated/model/apiTeamsPost201ResponseTeam";

// Extended interface to handle the API response with teams array
interface TeamsResponse extends ApiTeamsPost201Response {
  teams?: ApiTeamsPost201ResponseTeam[];
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teams-summary.component.html',
  styleUrl: './teams-summary.component.css'
})
export class TeamsSummaryComponent implements OnInit {
  teams: ApiTeamsPost201ResponseTeam[] = [];
  isLoading = false;

  constructor(
    private teamsService: TeamsService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.teamsService.apiTeamsGet().subscribe({
      next: (response: TeamsResponse) => {
        if (response && response.teams) {
          this.teams = response.teams;
        } else {
          this.teams = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
      }
    });
  }
}
