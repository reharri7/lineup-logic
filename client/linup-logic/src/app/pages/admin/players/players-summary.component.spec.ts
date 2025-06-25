import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersSummaryComponent } from './players-summary.component';

describe('PlayersSummaryComponent', () => {
  let component: PlayersSummaryComponent;
  let fixture: ComponentFixture<PlayersSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
