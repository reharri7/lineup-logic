import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionsSummaryComponent } from './positions-summary.component';

describe('PositionsComponent', () => {
  let component: PositionsSummaryComponent;
  let fixture: ComponentFixture<PositionsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
