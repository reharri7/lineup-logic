import { Component, OnInit } from '@angular/core';
import {ApiPlayersPost201ResponsePlayer, PlayersService} from "../../../../services/generated";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NotificationService } from "../../../../shared/services/notification.service";
import { ModalService } from "../../../../shared/services/modal.service";
import {FormBuilder, FormControl, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import { lastValueFrom } from "rxjs";
import { ApiPlayersPostRequest } from "../../../../services/generated";
import { TeamsDropdownComponent } from "../../../../components/teams-dropdown/teams-dropdown.component";
import { PositionsDropdownComponent } from "../../../../components/positions-dropdown/positions-dropdown.component";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TeamsDropdownComponent,
    PositionsDropdownComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit {
  public isRecordLoading = false;
  protected readonly recordId: number;
  protected player: ApiPlayersPost201ResponsePlayer = {};
  public formGroup: UntypedFormGroup = new FormBuilder().group({
    name: ['', Validators.required],
    number: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
    team_id: [null, Validators.required],
    position_id: [null, Validators.required]
  });

  constructor(
    private playersService: PlayersService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router,
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['playerId'] || 0);
  }

  get teamControl() {
    return this.formGroup.get('team_id') as FormControl;
  }

  get positionControl() {
    return this.formGroup.get('position_id') as FormControl;
  }

  async ngOnInit() {
    this.isRecordLoading = true;
    if(!!this.recordId) {
      const result = await lastValueFrom(this.playersService.apiPlayersIdGet(this.recordId));
      if(!!result && result.player) {
        this.player = result.player;
        this.formGroup.patchValue({
          name: this.player.name,
          number: this.player.number,
          team_id: this.player.team?.id,
          position_id: this.player.position?.id
        });
      }
    }
    this.isRecordLoading = false;
  }

  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if(this.formGroup.valid) {
      const formData: ApiPlayersPostRequest = this.formGroup.value;
      if(!!this.recordId) {
        const result = await lastValueFrom(this.playersService.apiPlayersIdPut(this.recordId, formData));
        if(!!result) {
          this.notificationService.showNotification('Player update', 'success');
        }
      } else {
        const result = await lastValueFrom(this.playersService.apiPlayersPost(formData));
        if(!!result && !!result.player) {
          this.notificationService.showNotification('Player created', 'success');
          await this.router.navigate(['/admin/players', result.player.id]);
        }
      }
    }
  }

  async onDelete() {
    if(!!this.recordId) {
      // Show confirmation modal
      const modalResult = await this.modalService.openModal({
        title: 'Delete Player',
        message: `Are you sure you want to delete this player "${this.player?.name || 'unknown'}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        showCancel: true,
        type: 'error'
      });

      // If user confirmed, proceed with deletion
      if (modalResult.confirmed) {
        try {
          await lastValueFrom(this.playersService.apiPlayersIdDelete(this.recordId));
          this.notificationService.showNotification('Player deleted successfully', 'success');
          await this.router.navigate(['/admin/players']);
        } catch (error) {
          this.notificationService.showNotification('Failed to delete player', 'error');
          console.error('Error deleting player:', error);
        }
      }
    }
  }
}
