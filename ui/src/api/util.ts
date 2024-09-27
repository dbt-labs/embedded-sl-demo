export class APIValueCache<T> {
  private _value: T | null = null;
  get value(): T | null {
    return this._value;
  }

  private _fetcher: () => Promise<T>;

  constructor(fetcher: () => Promise<T>) {
    this._fetcher = fetcher;
  }

  async fetch(): Promise<T> {
    this._value = await this._fetcher();
    return this._value;
  }

  expire(): void {
    this._value = null;
  }
}
