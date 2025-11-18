const _env = process.env

export class Config {
  private data: Record<string, any>

  [key: string]: any | ((key: string) => any) | ((key: string, value: any) => void)

  constructor () {
    this.data = {}

    const handler: ProxyHandler<this> = {
      set: (target, key: string, value: any): boolean => {
        target.set(key, value)
        return true
      },

      get: (target, key: string): any => {
        return target.get(key)
      },

      ownKeys: (target: this): ArrayLike<string | symbol> => {
        const internalKeys = Object.keys(target.data)
        const envKeys = Object.keys(_env)
        return [...internalKeys, ...envKeys]
      },

      getOwnPropertyDescriptor: (target: this, key: string): PropertyDescriptor | undefined => {
        const value = target.get(key)
        if (value !== undefined) {
          return {
            value,
            writable: true,
            enumerable: true, // Crucial for 'for...in'
            configurable: true
          }
        }
      }
    }

    return new Proxy(this, handler)
  }

  set (key: string, value: any): void {
    if (typeof value === 'string') {
      _env[key] = value
    } else {
      this.data[key] = value
    }
  }

  get (key: string): any {
    return _env[key] ?? this.data[key]
  }
}
