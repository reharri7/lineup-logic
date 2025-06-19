import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private renderer: Renderer2;
  private toastContainer: HTMLElement | null = null;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Shows a notification with the specified message
   * @param message The message to display in the notification
   * @param type The type of notification (info, success, error, warning)
   * @param duration Duration in milliseconds before the notification disappears (default: 3000ms)
   */
  showNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration: number = 3000): void {
    // Create toast container if it doesn't exist
    if (!this.toastContainer) {
      this.toastContainer = this.renderer.createElement('div');
      this.renderer.addClass(this.toastContainer, 'toast');
      this.renderer.addClass(this.toastContainer, 'toast-center');
      this.renderer.appendChild(document.body, this.toastContainer);
    }

    // Create alert element
    const alertElement = this.renderer.createElement('div');
    this.renderer.addClass(alertElement, 'alert');
    this.renderer.addClass(alertElement, `alert-${type}`);

    // Create message span
    const messageSpan = this.renderer.createElement('span');
    this.renderer.appendChild(messageSpan, this.renderer.createText(message));
    this.renderer.appendChild(alertElement, messageSpan);

    // Add alert to toast container
    this.renderer.appendChild(this.toastContainer, alertElement);

    // Remove notification after duration
    setTimeout(() => {
      if (this.toastContainer && this.toastContainer.contains(alertElement)) {
        this.renderer.removeChild(this.toastContainer, alertElement);
      }
    }, duration);
  }
}
