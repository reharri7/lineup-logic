import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {PositionsService} from "../../../services/generated/api/positions.service";
import {ApiPositionsPost201Response} from "../../../services/generated/model/apiPositionsPost201Response";
import {ApiPositionsPost201ResponsePosition} from "../../../services/generated/model/apiPositionsPost201ResponsePosition";

// Extended interface to handle the API response with positions array
interface PositionsResponse extends ApiPositionsPost201Response {
  positions?: ApiPositionsPost201ResponsePosition[];
}

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './positions-summary.component.html',
  styleUrl: './positions-summary.component.css'
})
export class PositionsSummaryComponent implements OnInit {
  positions: ApiPositionsPost201ResponsePosition[] = [];
  isLoading = false;

  constructor(
    private positionsService: PositionsService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions(): void {
    this.isLoading = true;
    this.positionsService.apiPositionsGet().subscribe({
      next: (response: PositionsResponse) => {
        if (response && response.positions) {
          this.positions = response.positions;
        } else {
          this.positions = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading positions:', error);
        this.isLoading = false;
      }
    });
  }
}
