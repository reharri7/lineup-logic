# Keyboard Shortcuts for Players Management

This document outlines the keyboard shortcuts implemented in the Players Management components to improve user experience and accessibility.

## Players Summary Component Shortcuts

| Shortcut | Action | Conditions |
|----------|--------|------------|
| `Ctrl+N` (Windows/Linux) or `⌘+N` (Mac) | Create a new player | Works when not focused on form fields |
| `Esc` | Navigate back to admin dashboard | Works when not focused on form fields |

## Player Component Shortcuts

| Shortcut | Action | Conditions |
|----------|--------|------------|
| `Ctrl+S` (Windows/Linux) or `⌘+S` (Mac) | Save/Submit the player form | Works when not focused on form fields |
| `Ctrl+D` (Windows/Linux) or `⌘+D` (Mac) | Delete the current player | Only works when editing an existing player (recordId exists) and not focused on form fields |
| `Esc` | Navigate back to the players list | Works when not focused on form fields |

## Implementation Details

### Players Summary Component

The keyboard shortcuts are implemented using Angular's `@HostListener` decorator to listen for keyboard events at the document level. The implementation includes platform detection to use the appropriate modifier key (Ctrl for Windows/Linux, Command/⌘ for Mac) and safeguards to prevent shortcuts from triggering when users are typing in form fields.

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
  
  // Create new player (Cmd+N on Mac, Ctrl+N on Windows/Linux)
  if (modifierKeyPressed && event.key === 'n') {
    event.preventDefault();
    this.createNewPlayer();
  }
  
  // Back to admin (Escape key)
  if (event.key === 'Escape') {
    event.preventDefault();
    this.goBack();
  }
}
```

Dynamic tooltips are added to the buttons in the HTML to inform users about the available shortcuts based on their platform:

```html
<button class="btn btn-outline tooltip" data-tip="Press Esc to go back" routerLink="/admin" (click)="goBack()">Back</button>
<button class="btn btn-success tooltip" [attr.data-tip]="modifierKeyText + '+N to create new player'" routerLink="new" (click)="createNewPlayer()">Create New Player</button>
```

## Accessibility Considerations

- Keyboard shortcuts are disabled when focus is on form fields to prevent interference with normal typing
- Visual tooltips are provided on buttons to inform users about available shortcuts
- Platform-specific shortcuts are used (Ctrl+N on Windows/Linux, ⌘+N on Mac) to align with platform conventions
- The implementation automatically detects the user's platform and uses the appropriate modifier key
