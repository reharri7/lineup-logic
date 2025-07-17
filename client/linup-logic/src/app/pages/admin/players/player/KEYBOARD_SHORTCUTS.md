# Keyboard Shortcuts for Player Component

This document outlines the keyboard shortcuts implemented in the Player Component to improve user experience and accessibility.

## Available Shortcuts

| Shortcut | Action | Conditions |
|----------|--------|------------|
| `Ctrl+S` (Windows/Linux) or `⌘+S` (Mac) | Save/Submit the player form | Works when not focused on form fields |
| `Ctrl+D` (Windows/Linux) or `⌘+D` (Mac) | Delete the current player | Only works when editing an existing player (recordId exists) and not focused on form fields |
| `Esc` | Navigate back to the players list | Works when not focused on form fields |

## Implementation Details

The keyboard shortcuts are implemented using Angular's `@HostListener` decorator to listen for keyboard events at the document level. The implementation includes platform detection to use the appropriate modifier key (Ctrl for Windows/Linux, Command/⌘ for Mac) and safeguards to prevent shortcuts from triggering when users are typing in form fields.

### Code Implementation

The keyboard shortcuts are implemented in `player.component.ts`:

```typescript
// Platform detection for keyboard shortcuts
public isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Get the appropriate modifier key display text for UI
get modifierKeyText(): string {
  return this.isMac ? '⌘' : 'Ctrl';
}

@HostListener('document:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Prevent shortcuts when typing in form fields
  if (event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement || 
      event.target instanceof HTMLSelectElement) {
    return;
  }
  
  // Check for the appropriate modifier key based on platform (Cmd for Mac, Ctrl for others)
  const modifierKeyPressed = this.isMac ? event.metaKey : event.ctrlKey;
  
  // Save/Submit form (Cmd+S on Mac, Ctrl+S on Windows/Linux)
  if (modifierKeyPressed && event.key === 's') {
    event.preventDefault(); // Prevent browser save dialog
    this.onSubmit();
  }
  
  // Delete player (Cmd+D on Mac, Ctrl+D on Windows/Linux) - only when editing an existing player
  if (modifierKeyPressed && event.key === 'd' && !!this.recordId) {
    event.preventDefault(); // Prevent browser bookmark dialog
    this.onDelete();
  }
  
  // Esc: Navigate back to players list
  if (event.key === 'Escape') {
    event.preventDefault();
    this.router.navigate(['/admin/players']);
  }
}
```

Dynamic tooltips are added to the buttons in the HTML to inform users about the available shortcuts based on their platform:

```html
<button class="btn btn-primary tooltip" [attr.data-tip]="modifierKeyText + '+S to save'" (click)="onSubmit()">Submit</button>
<button class="btn btn-error tooltip" [attr.data-tip]="modifierKeyText + '+D to delete'" (click)="onDelete()">Delete</button>
```

## Auto-Focus Functionality

The Player Component implements auto-focus functionality that automatically focuses on the first input field (Player Name) when the component loads. This improves user experience by allowing immediate typing without having to click on the field first.

### Implementation Details

The auto-focus functionality is implemented using Angular's `ViewChild` decorator to get a reference to the input element, and the `ngAfterViewInit` lifecycle hook to focus on the element after the view has been initialized.

```typescript
// Get a reference to the input element
@ViewChild('nameInput') nameInput: ElementRef;

// Focus on the input element after the view has been initialized
ngAfterViewInit() {
  this.focusNameInput();
}

// Helper method to focus on the name input field
private focusNameInput() {
  if (!this.isRecordLoading && this.nameInput?.nativeElement) {
    this.nameInput.nativeElement.focus();
  }
}
```

The implementation also includes a call to `focusNameInput()` after the loading is complete in the `ngOnInit` method to ensure the input field gets focused even if the form is loaded asynchronously.

```typescript
async ngOnInit() {
  // ... existing code ...
  this.isRecordLoading = false;
  
  // Focus on the first input field after loading is complete
  setTimeout(() => this.focusNameInput(), 0);
}
```

## Accessibility Considerations

- Keyboard shortcuts are disabled when focus is on form fields to prevent interference with normal typing
- Visual tooltips are provided on buttons to inform users about available shortcuts
- Platform-specific shortcuts are used (Ctrl+S on Windows/Linux, ⌘+S on Mac) to align with platform conventions
- The implementation automatically detects the user's platform and uses the appropriate modifier key
- Auto-focus on the first input field improves keyboard accessibility by eliminating the need for an initial mouse click
