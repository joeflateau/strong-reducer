export function entries<T, K extends keyof T>(t: T): [K, T[K]][] {
  return Object.entries(t) as any;
}
