import { EventEmitter } from "events";

interface CacheOptions {
  ttl?: number;
  capacity?: number;
}

interface CacheRecord<TValue> {
  val: TValue;
  expire: number;
  timeout: NodeJS.Timeout;
}

class Cache<TValue = unknown> extends EventEmitter {
  private _store: Record<string, CacheRecord<TValue>> = {};
  private _size: number = 0;
  private _ttl: number;
  private _capacity: number = Infinity;

  constructor(opts: CacheOptions = {}) {
    super();
    this._ttl = Number(opts.ttl);
    this.setCapacity(opts.capacity);
  }

  put(key: string, val: TValue, ttl?: number): void {
    if (key === undefined || val === undefined) {
      return;
    }

    if (!this._store[key] && this.size() >= this._capacity) {
      this.emit("drop", key, val, ttl);
      return;
    }

    ttl = ttl === undefined ? this._ttl : Number(ttl);

    this.del(key);

    this._store[key] = {
      val: val,
      expire: now() + ttl,
      timeout: setTimeout(() => {
        this.del(key);
      }, ttl),
    };
    this._store[key].timeout.unref();
    this._size += 1;

    this.emit("put", key, val, ttl);
  }

  get(key: string): TValue | undefined {
    let rec = this._store[key];

    if (rec) {
      if (!(rec.expire && rec.expire > now())) {
        this.del(key);
        this.emit("miss", key);
        rec = undefined as unknown as CacheRecord<TValue>;
      } else {
        this.emit("hit", key, rec.val);
      }
    } else {
      this.emit("miss", key);
    }

    return rec && rec.val;
  }

  del(key: string): TValue | undefined {
    if (this._store[key]) {
      const val = this._store[key].val;

      clearTimeout(this._store[key].timeout);
      delete this._store[key];
      this._size -= 1;
      this.emit("del", key, val);

      return val;
    }
  }

  clear(): void {
    Object.keys(this._store).forEach((key) => {
      this.del(key);
    });
  }

  size(accurate?: boolean): number {
    if (!accurate) {
      return this._size;
    }

    return Object.keys(this._store).reduce((size, key) => {
      return size + (this.get(key) !== undefined ? 1 : 0);
    }, 0);
  }

  setCapacity(capacity?: number): void {
    if (typeof capacity === "number" && capacity >= 0) {
      this._capacity = capacity;
    }
  }
}

function now(): number {
  return Date.now();
}

export default Cache;
