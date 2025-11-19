const _env = process.env

export class Config {
  private data: Record<string, any>

  [key: string]: any | ((key: string) => any) | ((key: string, value: any) => void)

  constructor () {
    this.data = {}

    const handler: ProxyHandler<this> = {
      set: (target, key: string, value: any): boolean => {
        if (value === undefined) {
          target.data[key] = value
          _env[key] = value
        } else {
          if (typeof value === 'string') {
            _env[key] = value
          } else {
            target.data[key] = value
          }
        }
        return true
      },

      get: (target, key: string): any => {
        return _env[key] ?? target.data[key]
      },

      ownKeys: (target: this): ArrayLike<string | symbol> => {
        const internalKeys = Object.keys(target.data)
        const envKeys = Object.keys(_env)
        return Array.from(new Set([...internalKeys, ...envKeys]))
      },

      getOwnPropertyDescriptor: (target: this, key: string): PropertyDescriptor | undefined => {
        const value = _env[key] ?? target.data[key]
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
}
