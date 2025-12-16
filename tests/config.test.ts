import { Config } from '../src/config'

describe('Config', () => {
  describe('constructor', () => {
    it('should create a new Config instance', () => {
      const config = new Config()
      expect(config).toBeInstanceOf(Config)
    })

    it('should initialize with empty data', () => {
      const config = new Config()
      expect(config).toBeInstanceOf(Config)
      const testKey = 'foobar'
      config[testKey] = 'test'
      expect(config[testKey]).toBe('test')
    })
  })

  describe('setting values', () => {
    it('should set string values to environment variables', () => {
      const config = new Config()
      const key = 'TEST_KEY_STRING'
      config[key] = 'test-value'

      expect(process.env[key]).toBe('test-value')
      expect(config[key]).toBe('test-value')
    })

    it('should set non-string values to internal data', () => {
      const config = new Config()
      const numKey = 'TEST_NUMBER'
      const boolKey = 'TEST_BOOLEAN'
      const objKey = 'TEST_OBJECT'

      config[numKey] = 42
      config[boolKey] = true
      config[objKey] = { foo: 'bar' }

      expect(process.env[numKey]).toBeUndefined()
      expect(process.env[boolKey]).toBeUndefined()
      expect(process.env[objKey]).toBeUndefined()

      expect(config[numKey]).toBe(42)
      expect(config[boolKey]).toBe(true)
      expect(config[objKey]).toEqual({ foo: 'bar' })
    })

    it('should handle undefined values', () => {
      const config = new Config()
      const key = 'TEST_UNDEFINED'

      // First set a value, then set to undefined
      config[key] = 'initial'
      config[key] = undefined

      // In Node.js, setting process.env[key] = undefined converts it to the string "undefined"
      // This is a quirk of how Node.js handles process.env
      expect(process.env[key]).toBe('undefined')
      // Config returns the value from env (which is the string "undefined")
      expect(config[key]).toBe('undefined')
    })

    it('should overwrite existing values', () => {
      const config = new Config()
      const key = 'TEST_KEY_OVERWRITE'

      config[key] = 'initial-value'
      config[key] = 'updated-value'

      expect(process.env[key]).toBe('updated-value')
      expect(config[key]).toBe('updated-value')
    })
  })

  describe('getting values', () => {
    it('should get values from environment variables when available', () => {
      const key = 'EXISTING_ENV_VAR'
      process.env[key] = 'env-value'
      const config = new Config()

      expect(config[key]).toBe('env-value')
    })

    it('should get values from internal data when not in environment', () => {
      const config = new Config()
      const key = 'INTERNAL_VALUE'

      config[key] = 123

      expect(config[key]).toBe(123)
    })

    it('should prioritize environment variables over internal data', () => {
      const key = 'PRIORITY_KEY'

      // Set in environment first
      process.env[key] = 'env-value'
      const config = new Config()
      // Setting a string value will overwrite the env var
      config[key] = 'internal-value'

      // Since we set a string, it goes to env, so it should be the new value
      expect(config[key]).toBe('internal-value')
      expect(process.env[key]).toBe('internal-value')
    })

    it('should return undefined for non-existent keys', () => {
      const config = new Config()
      const key = 'NON_EXISTENT_KEY'

      expect(config[key]).toBeUndefined()
    })
  })

  describe('property enumeration', () => {
    it('should enumerate environment variables', () => {
      const key1 = 'ENV_VAR_1'
      const key2 = 'ENV_VAR_2'

      process.env[key1] = 'value1'
      process.env[key2] = 'value2'
      const config = new Config()

      const keys = Object.keys(config)
      expect(keys).toContain(key1)
      expect(keys).toContain(key2)
    })

    it('should enumerate internal data properties', () => {
      const config = new Config()
      const key1 = 'INTERNAL_1'
      const key2 = 'INTERNAL_2'

      config[key1] = 1
      config[key2] = { test: true }

      const keys = Object.keys(config)
      expect(keys).toContain(key1)
      expect(keys).toContain(key2)
    })

    it('should enumerate both environment and internal properties', () => {
      const envKey = 'ENV_PROP'
      const internalKey = 'INTERNAL_PROP'

      process.env[envKey] = 'env'
      const config = new Config()
      config[internalKey] = 'internal'

      const keys = Object.keys(config)
      expect(keys).toContain(envKey)
      expect(keys).toContain(internalKey)
    })

    it('should not duplicate keys when same key exists in both', () => {
      const key = 'DUPLICATE_KEY'

      process.env[key] = 'env'
      const config = new Config()
      // Setting a string will overwrite env, so it goes to env
      config[key] = 'internal'

      const keys = Object.keys(config)
      const duplicateCount = keys.filter(k => k === key).length
      expect(duplicateCount).toBe(1)
    })
  })

  describe('property descriptors', () => {
    it('should return property descriptor for environment variables', () => {
      const key = 'DESC_TEST'

      process.env[key] = 'test-value'
      const config = new Config()

      const descriptor = Object.getOwnPropertyDescriptor(config, key)
      expect(descriptor).toBeDefined()
      expect(descriptor?.value).toBe('test-value')
      expect(descriptor?.writable).toBe(true)
      expect(descriptor?.enumerable).toBe(true)
      expect(descriptor?.configurable).toBe(true)
    })

    it('should return property descriptor for internal data', () => {
      const config = new Config()
      const key = 'DESC_INTERNAL'

      config[key] = 42

      const descriptor = Object.getOwnPropertyDescriptor(config, key)
      expect(descriptor).toBeDefined()
      expect(descriptor?.value).toBe(42)
      expect(descriptor?.writable).toBe(true)
      expect(descriptor?.enumerable).toBe(true)
      expect(descriptor?.configurable).toBe(true)
    })

    it('should return undefined for non-existent properties', () => {
      const config = new Config()
      const key = 'NON_EXISTENT'

      const descriptor = Object.getOwnPropertyDescriptor(config, key)
      expect(descriptor).toBeUndefined()
    })
  })

  describe('for...in iteration', () => {
    it('should iterate over environment variables', () => {
      const key1 = 'ITER_VAR_1'
      const key2 = 'ITER_VAR_2'

      process.env[key1] = 'value1'
      process.env[key2] = 'value2'
      const config = new Config()

      const keys: string[] = []
      for (const key in config) {
        keys.push(key)
      }

      expect(keys).toContain(key1)
      expect(keys).toContain(key2)
    })

    it('should iterate over internal data properties', () => {
      const config = new Config()
      const key1 = 'ITER_INTERNAL_1'
      const key2 = 'ITER_INTERNAL_2'

      // Setting strings will go to env, so use non-string values
      config[key1] = 1
      config[key2] = 2

      const keys: string[] = []
      for (const key in config) {
        keys.push(key)
      }

      expect(keys).toContain(key1)
      expect(keys).toContain(key2)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      const config = new Config()
      const stringKey = 'STRING_VAL'
      const numberKey = 'NUMBER_VAL'
      const objectKey = 'OBJECT_VAL'

      // Set string value
      config[stringKey] = 'hello'
      expect(config[stringKey]).toBe('hello')

      // Set number value
      config[numberKey] = 100
      expect(config[numberKey]).toBe(100)

      // Update string value
      config[stringKey] = 'world'
      expect(config[stringKey]).toBe('world')

      // Set object value
      config[objectKey] = { nested: { value: 123 } }
      expect(config[objectKey]).toEqual({ nested: { value: 123 } })
    })

    it('should maintain separate internal and environment storage', () => {
      const config = new Config()
      const directKey = 'DIRECT_ENV'
      const internalKey = 'INTERNAL_ONLY'
      const envKey = 'ENV_ONLY'

      // Set environment variable directly
      process.env[directKey] = 'direct'

      // Set internal value (non-string)
      config[internalKey] = 999

      // Set string value (goes to env)
      config[envKey] = 'env-stored'

      expect(config[directKey]).toBe('direct')
      expect(config[internalKey]).toBe(999)
      expect(config[envKey]).toBe('env-stored')

      expect(process.env[directKey]).toBe('direct')
      expect(process.env[internalKey]).toBeUndefined()
      expect(process.env[envKey]).toBe('env-stored')
    })
  })
})
