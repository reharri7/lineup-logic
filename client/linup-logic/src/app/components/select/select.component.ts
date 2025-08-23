import { ChangeDetectionStrategy, Component, Input, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageOverrides, ShowErrorWhen, getFirstErrorMessage } from '../../shared/utils/validation-messages';
import { uniqueId } from '../../shared/utils/unique-id';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select.component.html',
  styles: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements ControlValueAccessor {
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

  @Input() options: any[] = [];
  @Input() labelKey?: string;
  @Input() valueKey?: string;
  @Input() multiple = false;
  @Input() includeBlankOption = true;
  @Input() compareWith?: (a: any, b: any) => boolean;

  value: any = this.multiple ? [] : null;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  private _id?: string;
  get selectId(): string { return this.id || (this._id ||= uniqueId('sel')); }

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
      case 'sm': return 'select-sm';
      case 'lg': return 'select-lg';
      default: return '';
    }
  }

  get hintId(): string { return `${this.selectId}-hint`; }
  get errorId(): string { return `${this.selectId}-error`; }

  optionLabel(opt: any): string {
    if (this.labelKey) return String(opt?.[this.labelKey] ?? '');
    if (typeof opt === 'object' && opt && 'label' in opt) return String((opt as any).label);
    return String(opt);
  }

  optionValue(opt: any): any {
    if (this.valueKey) return opt?.[this.valueKey];
    if (typeof opt === 'object' && opt && 'value' in opt) return (opt as any).value;
    return opt;
  }

  isSelected(opt: any): boolean {
    const cmp = this.compareWith || ((a: any, b: any) => a === b);
    const val = this.optionValue(opt);
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.some((v: any) => cmp(v, val));
    }
    return cmp(this.value, val);
  }

  // CVA
  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onChangeSelection(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    if (this.multiple) {
      const selected: any[] = [];
      for (const option of Array.from(selectEl.selectedOptions)) {
        const idx = Number(option.getAttribute('data-index'));
        selected.push(this.optionValue(this.options[idx]));
      }
      this.value = selected;
      this.onChange(selected);
    } else {
      const opt = selectEl.selectedOptions[0];
      if (opt) {
        const attr = opt.getAttribute('data-index');
        const idx = attr === null ? NaN : Number(attr);
        if (Number.isNaN(idx)) {
          this.value = null;
          this.onChange(null);
        } else {
          const v = this.optionValue(this.options[idx]);
          this.value = v;
          this.onChange(v);
        }
      } else {
        this.value = null;
        this.onChange(null);
      }
    }
  }

  onBlur() { this.onTouched(); }
}
