# Positions Dropdown Component

A reusable dropdown component for selecting positions.

## Features

- Fetches positions from the API
- Displays positions in a dropdown
- Updates a form control with the selected position ID
- Shows loading state
- Shows validation errors

## Usage

### Import the component

```typescript
import { PositionsDropdownComponent } from 'src/app/components/positions-dropdown/positions-dropdown.component';

@Component({
  // ...
  imports: [
    // ...
    PositionsDropdownComponent
  ]
})
```

### Use in template with Reactive Forms

```typescript
// In your component class
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class YourComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      positionId: [null, Validators.required]
    });
  }
}
```

```html
<!-- In your component template -->
<form [formGroup]="form">
  <div class="form-control">
    <label class="label">
      <span class="label-text">Position</span>
    </label>
    <app-positions-dropdown [control]="form.get('positionId')"></app-positions-dropdown>
  </div>
</form>
```

### Use in template with standalone FormControl

```typescript
// In your component class
import { FormControl, Validators } from '@angular/forms';

export class YourComponent {
  positionControl = new FormControl(null, Validators.required);
}
```

```html
<!-- In your component template -->
<app-positions-dropdown [control]="positionControl"></app-positions-dropdown>
```
