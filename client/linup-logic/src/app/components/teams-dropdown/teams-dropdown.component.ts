import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TeamsService } from '../../services/generated/api/teams.service';
import { ApiTeamsPost201ResponseTeam } from '../../services/generated/model/apiTeamsPost201ResponseTeam';
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-teams-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teams-dropdown.component.html',
  styleUrls: ['./teams-dropdown.component.css']
})
export class TeamsDropdownComponent implements OnInit {
  @Input() control!: FormControl;

  teams: ApiTeamsPost201ResponseTeam[] = [];
  isLoading = false;

  constructor(private teamsService: TeamsService) {}

  async ngOnInit(): Promise<void> {
    await this.loadTeams();
  }

  async loadTeams(): Promise<void> {
    this.isLoading = true;
    this.teamsService.apiTeamsGet().subscribe({
      next: (response) => {
        if (response && response.teams) {
          this.teams = (response.teams || [])
            .slice()
            .sort((a: any, b: any) => (a?.name ?? '').localeCompare(b?.name ?? '', undefined, { sensitivity: 'base' }));
        } else {
          this.teams = [];
        }
        console.log(
          'Teams loaded:',
          this.teams
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.teams = [];
        this.isLoading = false;
      }
    });
  }

  // onTeamSelect method removed as we're now using [formControl] binding directly
}
