import { Component, Input, forwardRef, ChangeDetectionStrategy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { ShowErrorWhen, ErrorMessageOverrides, getFirstErrorMessage } from '../../shared/utils/validation-messages';
import { uniqueId } from '../../shared/utils/unique-id';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styles: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  @ViewChild('innerInput') innerInput?: ElementRef<HTMLInputElement>;

  @Input() label = '';
  @Input() hint?: string;
  @Input() id?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() error?: string | null;
  @Input() showErrorWhen: ShowErrorWhen = 'touched';
  @Input() errorMessages?: ErrorMessageOverrides;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' = 'text';
  @Input() autocomplete?: string;

  value: any = '';

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  get inputId(): string {
    return this.id || (this._id ||= uniqueId('in'));
  }
  private _id?: string;

  get describedBy(): string | null {
    const ids: string[] = [];
    if (this.hint) ids.push(this.hintId);
    if (this.errorText) ids.push(this.errorId);
    return ids.length ? ids.join(' ') : null;
  }

  get control() {
    return this.ngControl?.control ?? null;
  }

  get shouldShowError(): boolean {
    if (this.showErrorWhen === 'always') return true;
    const c = this.control;
    if (!c) return false;
    if (this.showErrorWhen === 'touched') return c.touched;
    if (this.showErrorWhen === 'dirty') return c.dirty;
    return false;
  }

  get invalid(): boolean {
    if (this.error) return true;
    const c = this.control;
    return !!(c && c.invalid && this.shouldShowError);
  }

  get errorText(): string | null {
    if (this.error) return this.error;
    const c = this.control;
    if (!c || !this.shouldShowError) return null;
    return getFirstErrorMessage(c.errors, this.errorMessages);
  }

  get controlSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'input-sm';
      case 'lg': return 'input-lg';
      default: return '';
    }
  }

  get hintId(): string { return `${this.inputId}-hint`; }
  get errorId(): string { return `${this.inputId}-error`; }

  // CVA
  writeValue(value: any): void { this.value = value; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  focus(): void {
    try {
      this.innerInput?.nativeElement?.focus();
    } catch {}
  }

  onInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    let val: any = target.value;
    if (this.type === 'number' && val !== '' && !isNaN(+val)) {
      val = +val;
    }
    this.value = val;
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
  }
}
