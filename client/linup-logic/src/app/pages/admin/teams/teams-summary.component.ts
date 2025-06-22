import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {TeamsService} from "../../../services/generated/api/teams.service";
import {ApiTeamsPost201ResponseTeam} from "../../../services/generated/model/apiTeamsPost201ResponseTeam";

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
    // todo: get all teams
    this.isLoading = false;
  }
}
