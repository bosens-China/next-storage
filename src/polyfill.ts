class Polyfill implements Storage {
  private obj: Record<string, string> = {};

  get length() {
    return Object.keys(this.obj).length;
  }

  setItem(key: string, value: string) {
    this.obj[key] = String(value);
  }

  getItem(key: string) {
    return this.obj[key] || null;
  }

  removeItem(key: string) {
    delete this.obj[key];
  }

  clear() {
    this.obj = {};
  }

  key(index: number) {
    return Object.keys(this.obj)[index] || null;
  }
}

export default Polyfill;
