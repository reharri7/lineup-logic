// Custom validator to check if passwords match
import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    // Return null if controls haven't initialized yet or if either control is invalid
    if (!password || !confirmPassword) {
      return null;
    }

    // Return null if another validator has already found an error on the matchingControl
    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    // Return error if passwords don't match
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  };
}
