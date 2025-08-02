import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { TeamDetailComponent } from './team-detail.component';
import { FantasyTeamsService } from 'src/app/services/generated/api/fantasyTeams.service';
import { PlayersService } from 'src/app/services/generated/api/players.service';
import { FantasyTeamPlayersService } from 'src/app/services/generated/api/fantasyTeamPlayers.service';

describe('TeamDetailComponent', () => {
  let component: TeamDetailComponent;
  let fixture: ComponentFixture<TeamDetailComponent>;
  let fantasyTeamsServiceSpy: jasmine.SpyObj<FantasyTeamsService>;
  let playersServiceSpy: jasmine.SpyObj<PlayersService>;
  let fantasyTeamPlayersServiceSpy: jasmine.SpyObj<FantasyTeamPlayersService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const fantasyTeamsSpy = jasmine.createSpyObj('FantasyTeamsService', [
      'apiFantasyTeamsIdGet',
      'apiFantasyTeamsIdPut',
      'apiFantasyTeamsIdDelete'
    ]);

    const playersSpy = jasmine.createSpyObj('PlayersService', [
      'apiPlayersGet'
    ]);

    const fantasyTeamPlayersSpy = jasmine.createSpyObj('FantasyTeamPlayersService', [
      'apiFantasyTeamsFantasyTeamIdPlayersPost',
      'apiFantasyTeamsFantasyTeamIdPlayersIdDelete'
    ]);

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, TeamDetailComponent],
      providers: [
        { provide: FantasyTeamsService, useValue: fantasyTeamsSpy },
        { provide: PlayersService, useValue: playersSpy },
        { provide: FantasyTeamPlayersService, useValue: fantasyTeamPlayersSpy },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' }))
          }
        }
      ]
    }).compileComponents();

    fantasyTeamsServiceSpy = TestBed.inject(FantasyTeamsService) as jasmine.SpyObj<FantasyTeamsService>;
    playersServiceSpy = TestBed.inject(PlayersService) as jasmine.SpyObj<PlayersService>;
    fantasyTeamPlayersServiceSpy = TestBed.inject(FantasyTeamPlayersService) as jasmine.SpyObj<FantasyTeamPlayersService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    const mockTeamResponse = {
      fantasy_team: { id: 1, name: 'Test Team', user_id: 1 },
      players: [
        { id: 1, name: 'Player 1', number: 10, fantasy_team_player_id: 1 },
        { id: 2, name: 'Player 2', number: 20, fantasy_team_player_id: 2 }
      ]
    };

    fantasyTeamsServiceSpy.apiFantasyTeamsIdGet.and.returnValue(of(mockTeamResponse));

    fixture = TestBed.createComponent(TeamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load team details on init', () => {
    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdGet).toHaveBeenCalledWith(1);
    expect(component.fantasyTeam).toBeTruthy();
    expect(component.players.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading team details', () => {
    fantasyTeamsServiceSpy.apiFantasyTeamsIdGet.and.returnValue(throwError(() => new Error('Test error')));

    component.ngOnInit();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdGet).toHaveBeenCalledWith(1);
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should navigate back to teams list', () => {
    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/fantasy-teams']);
  });

  it('should update team name', () => {
    const mockResponse = {
      fantasy_team: { id: 1, name: 'Updated Team', user_id: 1 }
    };

    fantasyTeamsServiceSpy.apiFantasyTeamsIdPut.and.returnValue(of(mockResponse));

    component.teamForm.setValue({ name: 'Updated Team' });
    component.saveTeam();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdPut).toHaveBeenCalledWith(1, {
      fantasy_team: { name: 'Updated Team' }
    });
  });

  it('should delete team and navigate back', () => {
    fantasyTeamsServiceSpy.apiFantasyTeamsIdDelete.and.returnValue(of({}));

    component.deleteTeam();

    expect(fantasyTeamsServiceSpy.apiFantasyTeamsIdDelete).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/fantasy-teams']);
  });

  it('should load available players when opening add player modal', () => {
    const mockPlayersResponse = {
      players: [
        { id: 3, name: 'Player 3', number: 30 },
        { id: 4, name: 'Player 4', number: 40 }
      ]
    };

    playersServiceSpy.apiPlayersGet.and.returnValue(of(mockPlayersResponse));

    component.openAddPlayerModal();

    expect(playersServiceSpy.apiPlayersGet).toHaveBeenCalled();
    expect(component.loadingPlayers).toBeFalse();
    expect(component.availablePlayers.length).toBe(2);
  });

  it('should add player to team', () => {
    const mockPlayer = { id: 3, name: 'Player 3', number: 30 };
    const mockResponse = {
      fantasy_team_player: { id: 3, fantasy_team_id: 1, player_id: 3 },
      player: mockPlayer
    };

    fantasyTeamPlayersServiceSpy.apiFantasyTeamsFantasyTeamIdPlayersPost.and.returnValue(of(mockResponse));
    fantasyTeamsServiceSpy.apiFantasyTeamsIdGet.and.returnValue(of({
      fantasy_team: component.fantasyTeam,
      players: [...component.players, mockPlayer]
    }));

    component.addPlayer(mockPlayer);

    expect(fantasyTeamPlayersServiceSpy.apiFantasyTeamsFantasyTeamIdPlayersPost).toHaveBeenCalledWith(1, {
      player: { player_id: 3 }
    });
  });

  it('should remove player from team', () => {
    const playerToRemove = component.players[0];

    fantasyTeamPlayersServiceSpy.apiFantasyTeamsFantasyTeamIdPlayersIdDelete.and.returnValue(of({}));
    fantasyTeamsServiceSpy.apiFantasyTeamsIdGet.and.returnValue(of({
      fantasy_team: component.fantasyTeam,
      players: [component.players[1]]
    }));

    component.removePlayer(playerToRemove);
    component.confirmRemovePlayer();

    expect(fantasyTeamPlayersServiceSpy.apiFantasyTeamsFantasyTeamIdPlayersIdDelete).toHaveBeenCalledWith(1, 1);
  });
});
