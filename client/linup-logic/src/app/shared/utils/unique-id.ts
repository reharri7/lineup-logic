let _uidCounter = 0;

/**
 * Generates a unique id string with an optional prefix.
 */
export function uniqueId(prefix = 'fld'): string {
  _uidCounter += 1;
  return `${prefix}-${_uidCounter}-${Math.random().toString(36).slice(2, 7)}`;
}
