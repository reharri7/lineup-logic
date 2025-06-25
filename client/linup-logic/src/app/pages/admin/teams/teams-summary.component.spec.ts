import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsSummaryComponent } from './teams-summary.component';

describe('TeamsComponent', () => {
  let component: TeamsSummaryComponent;
  let fixture: ComponentFixture<TeamsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
