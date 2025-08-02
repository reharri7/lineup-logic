import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { FantasyTeamsService } from 'src/app/services/generated/api/fantasyTeams.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let fantasyTeamsServiceSpy: jasmine.SpyObj<FantasyTeamsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FantasyTeamsService', [
      'apiFantasyTeamsGet',
      'apiFantasyTeamsPost',
      'apiFantasyTeamsIdPut',
      'apiFantasyTeamsIdDelete'
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, DashboardComponent],
      providers: [
        { provide: FantasyTeamsService, useValue: spy }
      ]
    }).compileComponents();

    fantasyTeamsServiceSpy = TestBed.inject(FantasyTeamsService) as jasmine.SpyObj<FantasyTeamsService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load fantasy teams on init', () => {
    const mockResponse = {
      fantasy_teams: [
        { id: 1, name: 'Team 1', user_id: 1 },
        { id: 2, name: 'Team 2', user_id: 1 }
      ]
    };

    fantasyTeamsServiceSpy.apiFantasyTeamsGet.and.returnValue(of(mockResponse));

    fixture.detectChanges(); // triggers ngOnInit

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsGet).toHaveBeenCalled();
    expect(component.fantasyTeams.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading fantasy teams', () => {
    fantasyTeamsServiceSpy.apiFantasyTeamsGet.and.returnValue(throwError(() => new Error('Test error')));

    fixture.detectChanges(); // triggers ngOnInit

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsGet).toHaveBeenCalled();
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should create a new team', () => {
    const mockResponse = {
      fantasy_team: { id: 3, name: 'New Team', user_id: 1 }
    };

    fantasyTeamsServiceSpy.apiFantasyTeamsPost.and.returnValue(of(mockResponse));

    component.teamForm.setValue({ name: 'New Team' });
    component.saveTeam();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsPost).toHaveBeenCalledWith({
      fantasy_team: { name: 'New Team' }
    });
  });

  it('should update an existing team', () => {
    const mockTeam = { id: 1, name: 'Team 1', user_id: 1 };
    const mockResponse = {
      fantasy_team: { id: 1, name: 'Updated Team', user_id: 1 }
    };

    fantasyTeamsServiceSpy.apiFantasyTeamsIdPut.and.returnValue(of(mockResponse));

    component.editingTeam = mockTeam;
    component.teamForm.setValue({ name: 'Updated Team' });
    component.saveTeam();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdPut).toHaveBeenCalledWith(1, {
      fantasy_team: { name: 'Updated Team' }
    });
  });

  it('should delete a team', () => {
    const mockTeam = { id: 1, name: 'Team 1', user_id: 1 };

    fantasyTeamsServiceSpy.apiFantasyTeamsIdDelete.and.returnValue(of({}));

    component.teamToDelete = mockTeam;
    component.deleteTeam();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdDelete).toHaveBeenCalledWith(1);
  });
});
