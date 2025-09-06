import { ValidationErrors } from '@angular/forms';

export type ShowErrorWhen = 'touched' | 'dirty' | 'always';
export type ErrorMessageOverrides = Partial<Record<string, string | ((e: any) => string)>>;

const defaultMessages: Record<string, (e: any) => string> = {
  required: () => 'This field is required.',
  minlength: (e: any) => `Must be at least ${e?.requiredLength ?? ''} characters.`,
  maxlength: (e: any) => `Must be at most ${e?.requiredLength ?? ''} characters.`,
  min: (e: any) => `Must be at least ${e?.min ?? ''}.`,
  max: (e: any) => `Must be at most ${e?.max ?? ''}.`,
  email: () => 'Enter a valid email.',
  pattern: () => `Value doesn't match the required format.`,
};

export function getFirstErrorMessage(
  errors: ValidationErrors | null | undefined,
  overrides?: ErrorMessageOverrides
): string | null {
  if (!errors) return null;
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const key = keys[0];
  const errObj: any = (errors as any)[key];

  const override = overrides?.[key];
  if (typeof override === 'string') return override;
  if (typeof override === 'function') return override(errObj);

  const def = defaultMessages[key];
  if (def) return def(errObj);
  return 'Invalid value.';
}
