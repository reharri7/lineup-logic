import {Component, OnInit} from '@angular/core';
import {
  ApiTeamsPost201Response, ApiTeamsPost201ResponseTeam,
  ApiTeamsPostRequest,
  TeamsService
} from "../../../../services/generated";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {NotificationService} from "../../../../shared/services/notification.service";
import {ModalService} from "../../../../shared/services/modal.service";

@Component({
  selector: 'app-team',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {
  public isRecordLoading  = false;
  protected readonly recordId: number;
  protected team: ApiTeamsPost201ResponseTeam = {};
  public formGroup: UntypedFormGroup = new FormBuilder().group({
    name: [''],
  });

  constructor(
    private TeamsService: TeamsService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router,
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['teamId'] || 0);
  }


  async ngOnInit() {
    this.isRecordLoading = true;
    if(!!this.recordId) {
      const result = await lastValueFrom(this.TeamsService.apiTeamsIdGet(this.recordId));
      if(!!result && result.team) {
        this.team = result.team;
        this.formGroup.patchValue(this.team);
      }
    }
    this.isRecordLoading = false;
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if(this.formGroup.valid) {
      const formData: ApiTeamsPostRequest = this.formGroup.value;
      if(!!this.recordId) {
        const result = await lastValueFrom(this.TeamsService.apiTeamsIdPut(this.recordId, formData));
        if(!!result) {
          this.notificationService.showNotification('Team update', 'success');
        }
      } else {
        const result = await lastValueFrom(this.TeamsService.apiTeamsPost(formData));
        if(!!result && !!result.team) {
          this.notificationService.showNotification('Team created', 'success');
          await this.router.navigate(['/admin/teams', result.team.id]);
        }
      }
    }
  }

  async onDelete() {
    if(!!this.recordId) {
      // Show confirmation modal
      const modalResult = await this.modalService.openModal({
        title: 'Delete Team',
        message: `Are you sure you want to delete this team "${this.team?.name || 'unknown'}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        showCancel: true,
        type: 'error'
      });

      // If user confirmed, proceed with deletion
      if (modalResult.confirmed) {
        try {
          await lastValueFrom(this.TeamsService.apiTeamsIdDelete(this.recordId));
          this.notificationService.showNotification('Team deleted successfully', 'success');
          // Navigate back or refresh the page as needed
          // You might want to add navigation logic here
          await this.router.navigate(['/admin/teams']);
        } catch (error) {
          this.notificationService.showNotification('Failed to delete team', 'error');
          console.error('Error deleting team:', error);
        }
      }
    }
  }
}
