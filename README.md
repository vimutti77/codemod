# codemod

This repository contains a collection of codemod scripts based for use with
[jscodeshift](https://github.com/facebook/jscodeshift) that help update MUI APIs.

## Setup & run

<!-- #default-branch-switch -->

```bash
npx @sharpinit/codemod <codemod> <paths...>

Applies a `@sharpinit/codemod` to the specified paths

Positionals:
  codemod  The name of the codemod                                [string]
  paths    Paths forwarded to `jscodeshift`                       [string]

Options:
  --version  Show version number                                 [boolean]
  --help     Show help                                           [boolean]
  --dry      dry run (no changes are made to files)
                                                [boolean] [default: false]
  --parser   which parser for jscodeshift to use.
                                                [string] [default: 'tsx']
  --print    print transformed files to stdout, useful for development
                                                [boolean] [default: false]
  --jscodeshift                                  [string] [default: false]

Examples:
  npx @sharpinit/codemod direct-import src --jscodeshift="--modules=@mui/icons-material"
```

### jscodeshift options

To pass more options directly to jscodeshift, use `--jscodeshift="..."`. For example:

```sh
npx @sharpinit/codemod --jscodeshift="--run-in-band --verbose=2"
```

See all available options [here](https://github.com/facebook/jscodeshift#usage-cli).

### Recast Options

Options to [recast](https://github.com/benjamn/recast)'s printer can be provided
through jscodeshift's `printOptions` command line argument

```sh
npx @sharpinit/codemod <transform> <path> --jscodeshift="--printOptions='{\"quote\":\"double\"}'"
```

Inspired by:
- [https://github.com/mui/material-ui/tree/master/packages/mui-codemod]
- [https://github.com/limpbrains/direct-import-codemod]
