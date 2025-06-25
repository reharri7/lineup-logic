# Teams Dropdown Component

A reusable dropdown component for selecting teams.

## Features

- Fetches teams from the API
- Displays teams in a dropdown
- Updates a form control with the selected team ID
- Shows loading state
- Shows validation errors

## Usage

### Import the component

```typescript
import { TeamsDropdownComponent } from 'src/app/components/teams-dropdown/teams-dropdown.component';

@Component({
  // ...
  imports: [
    // ...
    TeamsDropdownComponent
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
      teamId: [null, Validators.required]
    });
  }
}
```

```html
<!-- In your component template -->
<form [formGroup]="form">
  <div class="form-control">
    <label class="label">
      <span class="label-text">Team</span>
    </label>
    <app-teams-dropdown [control]="form.get('teamId')"></app-teams-dropdown>
  </div>
</form>
```

### Use in template with standalone FormControl

```typescript
// In your component class
import { FormControl, Validators } from '@angular/forms';

export class YourComponent {
  teamControl = new FormControl(null, Validators.required);
}
```

```html
<!-- In your component template -->
<app-teams-dropdown [control]="teamControl"></app-teams-dropdown>
```
