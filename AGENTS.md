# Project Overview

This repository contains an e2e testing tool called `cuke` which can be used to
run cucumber files to interact with a browser to achieve the end to end testing
requirements. The tool currently uses cucumber-js to parse and execute feature
files and also uses selneium (currently but can be changed to used playwright)
to interact with a browser. There are various built in steps for interacting
with a webpage and some for executing command line tools, http requests, etc.

Cuke builds on cucumber and adds functionality such as resolving variables in
step arguments with references suchas `${FOO}` that are really resolving in the
current javascript execution context so you can run any Javascript code in the
`${...}` block at runtime. Cuke also uses selenium in a special way as the various
web steps are in fact only refering to inputs, buttons, etc by their names on
screen and Cuke uses a fuzzy matching set of rules to find the element as best
as it can without relying on CSS selectors or xpath expressions which can break
and be very hard to maintain.

## Setup and Build

- Use `npm install` to install all of the required dependencies
- Use `npm run build` to build any deploy in dist/ the CLI that you can then use
  by simply running `cuke` if you have your node_modules/.bin/ directory in your `PATH`.

## Testing Commands

- Use `npm run test` to run the full suite of built in cucumber tests as is.
- Use `npm run coverage` to run the same full suite of cucumber tests but with code coverage instrumentation and reporting.
