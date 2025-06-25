import {Injectable, Renderer2, RendererFactory2} from '@angular/core';

export interface ModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export interface ModalResult {
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private renderer: Renderer2;
  private modalContainer: HTMLElement | null = null;
  private backdropElement: HTMLElement | null = null;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Opens a modal dialog with the specified options
   * @param options The configuration options for the modal
   * @returns A promise that resolves with the modal result when the modal is closed
   */
  openModal(options: ModalOptions): Promise<ModalResult> {
    return new Promise<ModalResult>((resolve) => {
      // Create modal container if it doesn't exist
      if (!this.modalContainer) {
        this.modalContainer = this.renderer.createElement('div');
        this.renderer.addClass(this.modalContainer, 'modal-container');
        this.renderer.setStyle(this.modalContainer, 'position', 'fixed');
        this.renderer.setStyle(this.modalContainer, 'z-index', '1000');
        this.renderer.appendChild(document.body, this.modalContainer);
      }

      // Create backdrop
      this.backdropElement = this.renderer.createElement('div');
      this.renderer.addClass(this.backdropElement, 'modal-backdrop');
      this.renderer.setStyle(this.backdropElement, 'position', 'fixed');
      this.renderer.setStyle(this.backdropElement, 'top', '0');
      this.renderer.setStyle(this.backdropElement, 'left', '0');
      this.renderer.setStyle(this.backdropElement, 'width', '100%');
      this.renderer.setStyle(this.backdropElement, 'height', '100%');
      this.renderer.setStyle(this.backdropElement, 'background-color', 'rgba(0, 0, 0, 0.5)');
      this.renderer.setStyle(this.backdropElement, 'z-index', '999');
      this.renderer.appendChild(document.body, this.backdropElement);

      // Create modal dialog
      const modalElement = this.renderer.createElement('div');
      this.renderer.addClass(modalElement, 'modal');
      this.renderer.addClass(modalElement, 'modal-open');

      // Create modal box
      const modalBoxElement = this.renderer.createElement('div');
      this.renderer.addClass(modalBoxElement, 'modal-box');

      // Add title if provided
      if (options.title) {
        const titleElement = this.renderer.createElement('h3');
        this.renderer.addClass(titleElement, 'font-bold');
        this.renderer.addClass(titleElement, 'text-lg');
        this.renderer.appendChild(titleElement, this.renderer.createText(options.title));
        this.renderer.appendChild(modalBoxElement, titleElement);
      }

      // Add message
      const messageElement = this.renderer.createElement('p');
      this.renderer.addClass(messageElement, 'py-4');
      this.renderer.appendChild(messageElement, this.renderer.createText(options.message));
      this.renderer.appendChild(modalBoxElement, messageElement);

      // Add buttons container
      const buttonsContainer = this.renderer.createElement('div');
      this.renderer.addClass(buttonsContainer, 'modal-action');

      // Add confirm button
      const confirmButton = this.renderer.createElement('button');
      this.renderer.addClass(confirmButton, 'btn');

      // Add type-specific class if type is provided
      if (options.type) {
        switch (options.type) {
          case 'success':
            this.renderer.addClass(confirmButton, 'btn-success');
            break;
          case 'error':
            this.renderer.addClass(confirmButton, 'btn-error');
            break;
          case 'warning':
            this.renderer.addClass(confirmButton, 'btn-warning');
            break;
          default:
            this.renderer.addClass(confirmButton, 'btn-primary');
        }
      } else {
        this.renderer.addClass(confirmButton, 'btn-primary');
      }

      this.renderer.appendChild(confirmButton, this.renderer.createText(options.confirmText || 'Confirm'));
      this.renderer.appendChild(buttonsContainer, confirmButton);

      // Add cancel button if showCancel is true
      if (options.showCancel) {
        const cancelButton = this.renderer.createElement('button');
        this.renderer.addClass(cancelButton, 'btn');
        this.renderer.appendChild(cancelButton, this.renderer.createText(options.cancelText || 'Cancel'));
        this.renderer.appendChild(buttonsContainer, cancelButton);

        // Add cancel button click handler
        this.renderer.listen(cancelButton, 'click', () => {
          this.closeModal();
          resolve({ confirmed: false });
        });
      }

      // Add confirm button click handler
      this.renderer.listen(confirmButton, 'click', () => {
        this.closeModal();
        resolve({ confirmed: true });
      });

      // Add buttons container to modal box
      this.renderer.appendChild(modalBoxElement, buttonsContainer);

      // Add modal box to modal
      this.renderer.appendChild(modalElement, modalBoxElement);

      // Add modal to container
      this.renderer.appendChild(this.modalContainer, modalElement);

      // Add backdrop click handler to close modal
      this.renderer.listen(this.backdropElement, 'click', () => {
        this.closeModal();
        resolve({ confirmed: false });
      });
    });
  }

  /**
   * Closes the currently open modal
   */
  private closeModal(): void {
    if (this.modalContainer) {
      this.renderer.removeChild(document.body, this.modalContainer);
      this.modalContainer = null;
    }

    if (this.backdropElement) {
      this.renderer.removeChild(document.body, this.backdropElement);
      this.backdropElement = null;
    }
  }
}
