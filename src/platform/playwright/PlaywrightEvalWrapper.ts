import { type Page, type Frame } from 'playwright'

export async function evalWrapper (context: Page | Frame | undefined, script: string, unwrappedArgs: any[]): Promise<any> {
  /* istanbul ignore next line */
  if (context == null) return null

  /* istanbul ignore next line */
  return await context.evaluateHandle(({ script, args }): any => {
    // eslint-disable-next-line
    const func = new Function(script)
    return func.apply(window, args)
  },
  { script, args: unwrappedArgs })
}
