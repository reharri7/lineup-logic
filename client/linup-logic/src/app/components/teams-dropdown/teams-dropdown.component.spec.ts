import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { TeamsDropdownComponent } from './teams-dropdown.component';
import { TeamsService } from '../../services/generated/api/teams.service';

describe('TeamsDropdownComponent', () => {
  let component: TeamsDropdownComponent;
  let fixture: ComponentFixture<TeamsDropdownComponent>;
  let mockTeamsService: jasmine.SpyObj<TeamsService>;

  beforeEach(async () => {
    mockTeamsService = jasmine.createSpyObj('TeamsService', ['apiTeamsGet']);
    mockTeamsService.apiTeamsGet.and.returnValue(of({
      teams: [
        { id: 1, name: 'Team 1' },
        { id: 2, name: 'Team 2' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TeamsDropdownComponent],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsDropdownComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load teams on init', () => {
    expect(mockTeamsService.apiTeamsGet).toHaveBeenCalled();
    expect(component.teams.length).toBe(2);
    expect(component.teams[0].name).toBe('Team 1');
  });

  it('should update form control when team is selected', () => {
    const event = { target: { value: '1' } } as unknown as Event;
    component.onTeamSelect(event);
    expect(component.control.value).toBe(1);
    expect(component.control.dirty).toBeTrue();
  });
});
