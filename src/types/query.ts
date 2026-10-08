export interface QueryState<T> {
  tag: string;
  data: T | null;
  error: string | null;
}
