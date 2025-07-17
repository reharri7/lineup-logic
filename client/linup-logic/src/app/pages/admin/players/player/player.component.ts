import { Component, OnInit, HostListener } from '@angular/core';
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
  protected recordId: number;
  protected player: ApiPlayersPost201ResponsePlayer = {};
  public formGroup: UntypedFormGroup;

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

    // Save/Submit form (Cmd+S on Mac, Ctrl+S on Windows/Linux)
    if (modifierKeyPressed && event.key === 's') {
      event.preventDefault(); // Prevent browser save dialog
      this.onSubmit();
    }

    // Delete player (Cmd+D on Mac, Ctrl+D on Windows/Linux) - only when editing an existing player
    if (modifierKeyPressed && event.key === 'd' && !!this.recordId) {
      event.preventDefault(); // Prevent browser bookmark dialog
      this.onDelete();
    }

    // Esc: Navigate back to players list
    if (event.key === 'Escape') {
      event.preventDefault();
      this.router.navigate(['/admin/players']);
    }
  }

  constructor(
    private playersService: PlayersService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['playerId'] || 0);
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      number: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
      team_id: [null, Validators.required],
      position_id: [null, Validators.required]
    });
  }

  get teamControl() {
    return this.formGroup?.get('team_id') as FormControl;
  }

  get positionControl() {
    return this.formGroup?.get('position_id') as FormControl;
  }

  async ngOnInit() {
    this.isRecordLoading = true;

    if(!!this.recordId) {
      const result = await lastValueFrom(this.playersService.apiPlayersIdGet(this.recordId));
      if(!!result && result.player) {
        this.player = result.player;
        console.log(this.player);
        this.formGroup.patchValue({
          name: this.player.name,
          number: this.player.number,
          team_id: this.player.team?.id,
          position_id: this.player.position?.id
        });
        console.log(this.formGroup.value);
      }
    }
    this.isRecordLoading = false;
  }

  async onSubmit() {
    this.formGroup?.markAllAsTouched();
    if(this.formGroup?.valid) {
      const formData: ApiPlayersPostRequest = this.formGroup?.value;
      if(!!this.recordId) {
        const result = await lastValueFrom(this.playersService.apiPlayersIdPut(this.recordId, formData));
        if(!!result) {
          this.notificationService.showNotification('Player update', 'success');
        }
      } else {
        const result = await lastValueFrom(this.playersService.apiPlayersPost(formData));
        if(!!result && !!result.player && !!result.player.id) {
          this.notificationService.showNotification('Player created', 'success');
          this.recordId = result.player.id;
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
