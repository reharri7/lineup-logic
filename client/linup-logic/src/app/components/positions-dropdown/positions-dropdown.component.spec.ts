import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PositionsDropdownComponent } from './positions-dropdown.component';
import { PositionsService } from '../../services/generated/api/positions.service';

describe('PositionsDropdownComponent', () => {
  let component: PositionsDropdownComponent;
  let fixture: ComponentFixture<PositionsDropdownComponent>;
  let mockPositionsService: jasmine.SpyObj<PositionsService>;

  beforeEach(async () => {
    mockPositionsService = jasmine.createSpyObj('PositionsService', ['apiPositionsGet']);
    mockPositionsService.apiPositionsGet.and.returnValue(of({
      positions: [
        { id: 1, position_name: 'Goalkeeper' },
        { id: 2, position_name: 'Defender' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, PositionsDropdownComponent],
      providers: [
        { provide: PositionsService, useValue: mockPositionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PositionsDropdownComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load positions on init', () => {
    expect(mockPositionsService.apiPositionsGet).toHaveBeenCalled();
    expect(component.positions.length).toBe(2);
    expect(component.positions[0].position_name).toBe('Goalkeeper');
  });

  it('should update form control when position is selected', () => {
    const event = { target: { value: '1' } } as unknown as Event;
    component.onPositionSelect(event);
    expect(component.control.value).toBe(1);
    expect(component.control.dirty).toBeTrue();
  });
});
