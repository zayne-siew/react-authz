import type { FgaObject } from '@openfga/sdk';

/**
 * Parses a string representation of an OpenFGA object into its type and id.
 *
 * The expected format is `"type:id"`, e.g., `"organization:acme"`.
 * If the format is invalid, the function throws an error.
 *
 * @example
 * const fgaObject = parseFgaObject('organization:acme');
 * console.log(fgaObject.type); // 'organization'
 * console.log(fgaObject.id);   // 'acme'
 */
export function parseFgaObject(fgaResult: string): FgaObject {
  if (!fgaResult.includes(':')) {
    throw new Error(
      `Invalid FGA object format: ${fgaResult}. Expected format is "type:id".`,
    );
  }

  const idx = fgaResult.indexOf(':');
  return {
    type: fgaResult.slice(0, idx),
    id: fgaResult.slice(idx + 1),
  } as FgaObject;
}

/**
 * Parses an OpenFGA object into a string representation.
 *
 * @example
 * const result = stringifyFgaObject({ type: 'organization', id: 'acme' });
 * console.log(result); // 'organization:acme'
 */
export function stringifyFgaObject(fgaObject: FgaObject): string {
  return `${fgaObject.type}:${fgaObject.id}`;
}
