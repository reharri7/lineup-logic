import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PositionsService } from '../../services/generated/api/positions.service';
import { ApiPositionsPost201ResponsePosition } from '../../services/generated/model/apiPositionsPost201ResponsePosition';
import { lastValueFrom } from 'rxjs';
import { ApiPlayersGet200ResponsePlayersInnerPosition } from '../../services/generated';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-positions-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent],
  templateUrl: './positions-dropdown.component.html',
  styleUrls: ['./positions-dropdown.component.css']
})
export class PositionsDropdownComponent implements OnInit {
  @Input() control!: FormControl;

  positions: ApiPlayersGet200ResponsePlayersInnerPosition[] = [];
  isLoading = false;

  constructor(private positionsService: PositionsService) {}

  async ngOnInit(): Promise<void> {
    await this.loadPositions();
  }

  async loadPositions(): Promise<void> {
    this.isLoading = true;
    try {
      const result = await lastValueFrom(this.positionsService.apiPositionsGet());
      if (!!result && !!result.positions?.length) {
        this.positions = result.positions;
      } else {
        this.positions = [];
      }
    } catch (e) {
      console.error('Error loading positions:', e);
      this.positions = [];
    } finally {
      this.isLoading = false;
    }
  }

  // onPositionSelect method removed as we're now using [formControl] binding directly
}
