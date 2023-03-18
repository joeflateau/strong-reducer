export function entries<T extends Record<string, unknown>, K extends keyof T>(
  t: T,
): [K, T[K]][] {
  return Object.entries(t) as any;
}
