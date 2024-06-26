#! /usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
const childProcess = require('child_process')
const { promises: fs } = require('fs')
const path = require('path')
const yargs = require('yargs')
const jscodeshiftPackage = require('jscodeshift/package.json')

const jscodeshiftDirectory = path.dirname(require.resolve('jscodeshift'))
const jscodeshiftExecutable = path.join(jscodeshiftDirectory, jscodeshiftPackage.bin.jscodeshift)

async function runTransform(transform, files, flags, codemodFlags) {
  const transformerSrcPath = path.resolve(__dirname, './transforms', `${transform}.js`)
  const transformerBuildPath = path.resolve(__dirname, './node', `${transform}.js`)
  let transformerPath
  try {
    await fs.stat(transformerSrcPath)
    transformerPath = transformerSrcPath
  } catch (srcPathError) {
    try {
      await fs.stat(transformerBuildPath)
      transformerPath = transformerBuildPath
    } catch (buildPathError) {
      if (buildPathError.code === 'ENOENT') {
        throw new Error(`Transform '${transform}' not found.`)
      }
      throw buildPathError
    }
  }

  const args = [
    // can't directly spawn `jscodeshiftExecutable` due to https://github.com/facebook/jscodeshift/issues/424
    jscodeshiftExecutable,
    '--transform',
    transformerPath,
    ...codemodFlags,
    '--extensions',
    'js,ts,jsx,tsx',
    '--parser',
    flags.parser || 'tsx',
    '--ignore-pattern',
    '**/node_modules/**',
  ]

  if (flags.dry) {
    args.push('--dry')
  }
  if (flags.print) {
    args.push('--print')
  }
  if (flags.jscodeshift) {
    args.push(flags.jscodeshift)
  }

  args.push(...files)

  // eslint-disable-next-line no-console -- debug information
  console.log(`Executing command: jscodeshift ${args.join(' ')}`)
  const jscodeshiftProcess = childProcess.spawnSync('node', args, { stdio: 'inherit' })

  if (jscodeshiftProcess.error) {
    throw jscodeshiftProcess.error
  }
}

function run(argv) {
  const { codemod, paths, ...flags } = argv

  return runTransform(
    codemod,
    paths.map((filePath) => path.resolve(filePath)),
    flags,
    argv._,
  )
}

yargs
  .command({
    command: '$0 <codemod> <paths...>',
    describe: 'Applies a `@sharpinit/codemod` to the specified paths',
    builder: (command) => {
      return command
        .positional('codemod', {
          description: 'The name of the codemod',
          type: 'string',
        })
        .positional('paths', {
          array: true,
          description: 'Paths forwarded to `jscodeshift`',
          type: 'string',
        })
        .option('dry', {
          description: 'dry run (no changes are made to files)',
          default: false,
          type: 'boolean',
        })
        .option('parser', {
          description: 'which parser for jscodeshift to use',
          default: 'tsx',
          type: 'string',
        })
        .option('print', {
          description: 'print transformed files to stdout, useful for development',
          default: false,
          type: 'boolean',
        })
        .option('jscodeshift', {
          description: '(Advanced) Pass options directly to jscodeshift',
          default: false,
          type: 'string',
        })
        .option('options', {
          description: 'codemod options',
          default: false,
          type: 'string',
        })
    },
    handler: run,
  })
  .scriptName('pnpx @sharpinit/codemod')
  .example('$0 app')
  .help()
  .parse()
