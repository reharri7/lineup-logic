import { TestBed } from '@angular/core/testing';
import { RendererFactory2 } from '@angular/core';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let rendererFactoryMock: jasmine.SpyObj<RendererFactory2>;
  let rendererMock: any;

  beforeEach(() => {
    // Create mock for renderer and renderer factory
    rendererMock = {
      createElement: jasmine.createSpy('createElement').and.returnValue(document.createElement('div')),
      addClass: jasmine.createSpy('addClass'),
      appendChild: jasmine.createSpy('appendChild'),
      createText: jasmine.createSpy('createText').and.returnValue(document.createTextNode('')),
      removeChild: jasmine.createSpy('removeChild')
    };

    rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: RendererFactory2, useValue: rendererFactoryMock }
      ]
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a toast notification with the provided message', () => {
    // Arrange
    const message = 'Test notification message';

    // Act
    service.showNotification(message);

    // Assert
    expect(rendererMock.createElement).toHaveBeenCalledWith('div');
    expect(rendererMock.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'alert');
    expect(rendererMock.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'alert-info');
    expect(rendererMock.createText).toHaveBeenCalledWith(message);
  });

  it('should create a notification with the specified type', () => {
    // Act
    service.showNotification('Test message', 'success');

    // Assert
    expect(rendererMock.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'alert-success');
  });

  it('should remove the notification after the specified duration', () => {
    // Arrange
    jasmine.clock().install();

    // Act
    service.showNotification('Test message', 'info', 1000);
    jasmine.clock().tick(1001);

    // Assert
    expect(rendererMock.removeChild).toHaveBeenCalled();

    // Cleanup
    jasmine.clock().uninstall();
  });
});
