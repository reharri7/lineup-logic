import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FantasyTeamsService } from 'src/app/services/generated/api/fantasyTeams.service';
import { ApiFantasyTeamsGet200ResponseFantasyTeamsInner } from 'src/app/services/generated/model/apiFantasyTeamsGet200ResponseFantasyTeamsInner';

@Component({
  selector: 'app-fantasy-teams-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DashboardComponent implements OnInit {
  fantasyTeams: ApiFantasyTeamsGet200ResponseFantasyTeamsInner[] = [];
  loading = false;
  error: string | null = null;

  showTeamModal = false;
  showDeleteModal = false;

  teamForm: FormGroup;

  editingTeam: ApiFantasyTeamsGet200ResponseFantasyTeamsInner | null = null;
  teamToDelete: ApiFantasyTeamsGet200ResponseFantasyTeamsInner | null = null;

  constructor(
    private fantasyTeamsService: FantasyTeamsService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFantasyTeams();
  }

  loadFantasyTeams(): void {
    this.loading = true;
    this.error = null;

    this.fantasyTeamsService.apiFantasyTeamsGet()
      .subscribe({
        next: (response) => {
          this.fantasyTeams = response.fantasy_teams || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load fantasy teams. Please try again.';
          console.error('Error loading fantasy teams:', err);
          this.loading = false;
        }
      });
  }

  openCreateTeamModal(): void {
    this.editingTeam = null;
    this.teamForm.reset();
    this.showTeamModal = true;
  }

  editTeam(team: ApiFantasyTeamsGet200ResponseFantasyTeamsInner): void {
    this.editingTeam = team;
    this.teamForm.patchValue({
      name: team.name
    });
    this.showTeamModal = true;
  }

  closeTeamModal(): void {
    this.showTeamModal = false;
  }

  saveTeam(): void {
    if (this.teamForm.invalid) return;

    const teamData = {
      fantasy_team: {
        name: this.teamForm.value.name
      }
    };

    if (this.editingTeam) {
      this.fantasyTeamsService.apiFantasyTeamsIdPut(this.editingTeam.id!, teamData)
        .subscribe({
          next: () => {
            this.closeTeamModal();
            this.loadFantasyTeams();
          },
          error: (err) => {
            this.error = 'Failed to update team. Please try again.';
            console.error('Error updating team:', err);
          }
        });
    } else {
      this.fantasyTeamsService.apiFantasyTeamsPost(teamData)
        .subscribe({
          next: () => {
            this.closeTeamModal();
            this.loadFantasyTeams();
          },
          error: (err) => {
            this.error = 'Failed to create team. Please try again.';
            console.error('Error creating team:', err);
          }
        });
    }
  }

  confirmDeleteTeam(team: ApiFantasyTeamsGet200ResponseFantasyTeamsInner): void {
    this.teamToDelete = team;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.teamToDelete = null;
  }

  deleteTeam(): void {
    if (!this.teamToDelete) return;

    this.fantasyTeamsService.apiFantasyTeamsIdDelete(this.teamToDelete.id!)
      .subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadFantasyTeams();
        },
        error: (err) => {
          this.error = 'Failed to delete team. Please try again.';
          console.error('Error deleting team:', err);
          this.closeDeleteModal();
        }
      });
  }

  viewTeamDetails(teamId: number | undefined): void {
    if (teamId) {
      this.router.navigate(['/fantasy-teams', teamId]);
    }
  }
}
