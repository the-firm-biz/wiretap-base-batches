/* eslint-disable @typescript-eslint/no-explicit-any */
export function bigIntReplacer(_key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}
