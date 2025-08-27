import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageOverrides, ShowErrorWhen, getFirstErrorMessage } from '../../shared/utils/validation-messages';
import { uniqueId } from '../../shared/utils/unique-id';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

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
  @Input() rows = 3;
  @Input() maxLength?: number;
  @Input() readonly = false;

  value: string = '';

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  private _id?: string;
  get textareaId(): string { return this.id || (this._id ||= uniqueId('ta')); }

  constructor() {
    if (this.ngControl) {
      (this.ngControl as any).valueAccessor = this;
    }
  }

  get describedBy(): string | null {
    const ids: string[] = [];
    if (this.hint) ids.push(this.hintId);
    if (this.errorText) ids.push(this.errorId);
    return ids.length ? ids.join(' ') : null;
  }

  get control() { return this.ngControl?.control ?? null; }

  get shouldShowError(): boolean {
    if (this.showErrorWhen === 'always') return true;
    const c = this.control; if (!c) return false;
    if (this.showErrorWhen === 'touched') return c.touched;
    if (this.showErrorWhen === 'dirty') return c.dirty;
    return false;
  }

  get invalid(): boolean {
    if (this.error) return true;
    const c = this.control; return !!(c && c.invalid && this.shouldShowError);
  }

  get errorText(): string | null {
    if (this.error) return this.error;
    const c = this.control; if (!c || !this.shouldShowError) return null;
    return getFirstErrorMessage(c.errors, this.errorMessages);
  }

  get controlSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'textarea-sm';
      case 'lg': return 'textarea-lg';
      default: return '';
    }
  }

  get hintId(): string { return `${this.textareaId}-hint`; }
  get errorId(): string { return `${this.textareaId}-error`; }

  // CVA
  writeValue(value: any): void { this.value = value ?? ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(evt: Event) {
    const target = evt.target as HTMLTextAreaElement;
    const val = target.value;
    this.value = val;
    this.onChange(val);
  }

  onBlur() { this.onTouched(); }
}
