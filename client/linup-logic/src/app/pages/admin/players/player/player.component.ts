import { Component } from '@angular/core';
import {PlayersService} from "../../../../services/generated";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../../shared/services/notification.service";
import {ModalService} from "../../../../shared/services/modal.service";

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  isRecordLoading  = false;
  protected readonly recordId: number;

  constructor(
    private playersService: PlayersService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router,
  ) {
    this.recordId = Number(this.activatedRoute.snapshot.params['playerId'] || 0);
  }

}
