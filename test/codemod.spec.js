const fs = require('fs')
const path = require('path')
const testUtils = require('jscodeshift/src/testUtils')

const testTransform = (name, { filePath } = {}) => {
  describe(name, () => {
    const root = path.join(__dirname, '..')
    const transformPath = `${root}/transforms/${name}.js`
    const fixturesPath = `${root}/test/fixtures/${name}`

    if (!fs.existsSync(fixturesPath)) {
      it.skip('create tests in ./test/fixtures/<transform-name>/<scenario-name>.input.js', () => {})
      return
    }

    fs.readdirSync(fixturesPath)
      .filter((filename) => filename.endsWith('.input.js'))
      .map((filename) => filename.replace('.input.js', ''))
      .forEach((id) => {
        const inputPath = `${fixturesPath}/${id}.input.js`
        const optionsPath = `${fixturesPath}/${id}.options.js`
        const displayPath = path.relative(root, inputPath)

        it(displayPath, () => {
          const transform = require(transformPath)
          const options = require(optionsPath)
          const input = fs.readFileSync(inputPath, 'utf8')
          testUtils.runSnapshotTest(transform, options, { path: filePath, source: input })
        })
      })
  })
}

// To write tests, create fixture files in the locations below and they
// will be discovered and run:
//
// ./test/fixtures/<transform-name>/<scenario-name>.input.js
// ./test/fixtures/<transform-name>/<scenario-name>.options.js

fs.readdirSync(path.resolve(__dirname, '../transforms'))
  .filter((filename) => filename.endsWith('.js'))
  .map((filename) => filename.replace('.js', ''))
  .forEach((transformName) => {
    testTransform(transformName)
  })
