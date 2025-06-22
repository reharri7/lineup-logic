import {Component, OnInit} from '@angular/core';
import {
  ApiTeamsPost201Response,
  ApiTeamsPostRequest,
  TeamsService
} from "../../../../services/generated";
import {ActivatedRoute} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {NotificationService} from "../../../../shared/services/notification.service";

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
  protected team: ApiTeamsPost201Response = {};
  public formGroup: UntypedFormGroup = new FormBuilder().group({
    name: [''],
  });

  constructor(
    private TeamsService: TeamsService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['teamId'] || 0);
  }


  async ngOnInit() {
    this.isRecordLoading = true;
    if(!!this.recordId) {
      const result = await lastValueFrom(this.TeamsService.apiTeamsIdGet(this.recordId));
      if(!!result) {
        this.team = result;
        this.formGroup.patchValue(this.team);
      }
    }
    this.isRecordLoading = false;
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if(this.formGroup.valid) {
      const formData: ApiTeamsPostRequest = this.formGroup.value;
      if(!!this.recordId) {
        const result = await lastValueFrom(this.TeamsService.apiTeamsIdPut(this.recordId, formData));
        if(!!result) {
          this.notificationService.showNotification('Team created', 'success');
        }
      } else {
        const result = await lastValueFrom(this.TeamsService.apiTeamsPost(formData));
        if(!!result) {
          this.notificationService.showNotification('Team updated', 'success');
        }
      }
    }
  }

  onDelete() {
    if(!!this.recordId) {

    }
  }
}

