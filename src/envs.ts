import * as dotenv from 'dotenv'
import { dirname, resolve } from 'path'
import { lstatSync } from 'fs'

function loadEnvs (path: string): void {
  if (lstatSync(path).isDirectory()) {
    path = resolve(path)
  } else {
    path = resolve(dirname(path))
  }

  while (path !== process.cwd()) {
    dotenv.config({ path: `${path}/.env`, debug: Boolean(process.env.DEBUG) })
    path = dirname(path)
  }
}

function resolveVariables (value: string): string {
  // construct a set of "let" statements that can expose all environment
  // variables as local variables with the same name
  let envString = ''
  for (const name in process.env) {
    // using the `...` quotes allows us to put values that have any
    // number of special characters including carriage returns and
    // quotes of any other kind
    envString += `let ${name}=process.env['${name}'];\n`
  }

  // eslint-disable-next-line
  return eval(`(function() { ${envString}; return \`${value}\`})()`)
}

function findVariables (value: string): string[] {
  const matches = value.matchAll(/\$\{([^{}]+)\}/g)
  return Array.from(matches).map(match => match[1])
}

export { findVariables, loadEnvs, resolveVariables }
