import {Component, OnInit} from '@angular/core';
import {
  PositionsService
} from "../../../../services/generated";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {NotificationService} from "../../../../shared/services/notification.service";
import {ModalService} from "../../../../shared/services/modal.service";
import {ApiPositionsPost201ResponsePosition} from "../../../../services/generated/model/apiPositionsPost201ResponsePosition";
import {ApiPositionsPostRequest} from "../../../../services/generated/model/apiPositionsPostRequest";
import { InputComponent } from '../../../../components/input/input.component';

@Component({
  selector: 'app-position',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputComponent
  ],
  templateUrl: './position.component.html',
  styleUrl: './position.component.css'
})
export class PositionComponent implements OnInit {
  public isRecordLoading  = false;
  protected readonly recordId: number;
  protected position: ApiPositionsPost201ResponsePosition = {};
  public formGroup: UntypedFormGroup = new FormBuilder().group({
    position_name: [''],
  });

  constructor(
    private PositionsService: PositionsService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router,
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['positionId'] || 0);
  }


  async ngOnInit() {
    this.isRecordLoading = true;
    if(!!this.recordId) {
      const result = await lastValueFrom(this.PositionsService.apiPositionsIdGet(this.recordId));
      if(!!result && result.position) {
        this.position = result.position;
        this.formGroup.patchValue(this.position);
      }
    }
    this.isRecordLoading = false;
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if(this.formGroup.valid) {
      const formData: ApiPositionsPostRequest = this.formGroup.value;
      if(!!this.recordId) {
        const result = await lastValueFrom(this.PositionsService.apiPositionsIdPut(this.recordId, formData));
        if(!!result) {
          this.notificationService.showNotification('Position update', 'success');
        }
      } else {
        const result = await lastValueFrom(this.PositionsService.apiPositionsPost(formData));
        if(!!result && !!result.position) {
          this.notificationService.showNotification('Position created', 'success');
          await this.router.navigate(['/admin/positions', result.position.id]);
        }
      }
    }
  }

  async onDelete() {
    if(!!this.recordId) {
      // Show confirmation modal
      const modalResult = await this.modalService.openModal({
        title: 'Delete Position',
        message: `Are you sure you want to delete this position "${this.position?.position_name || 'unknown'}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        showCancel: true,
        type: 'error'
      });

      // If user confirmed, proceed with deletion
      if (modalResult.confirmed) {
        try {
          await lastValueFrom(this.PositionsService.apiPositionsIdDelete(this.recordId));
          this.notificationService.showNotification('Position deleted successfully', 'success');
          // Navigate back or refresh the page as needed
          await this.router.navigate(['/admin/positions']);
        } catch (error) {
          this.notificationService.showNotification('Failed to delete position', 'error');
          console.error('Error deleting position:', error);
        }
      }
    }
  }
}
