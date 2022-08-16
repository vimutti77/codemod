/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
module.exports = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const includeModules = options.modules?.split(',') ?? []
  console.log(includeModules, options)

  if (includeModules.length === 0) return fileInfo.source

  const result = j(fileInfo.source)
    .find(j.ImportDeclaration)
    .filter((path) => includeModules.includes(path.value.source.value))
    .forEach((path) => {
      const importDeclaration = path.value
      const modules = importDeclaration.specifiers?.filter((n) => n.type === 'ImportSpecifier')

      modules.forEach((module) => {
        if (!module.local) return
        const varName = module.local.name
        const importPath = `${importDeclaration.source.value}/${module.imported.name}`
        j(path).insertAfter(
          j.importDeclaration([j.importDefaultSpecifier(j.identifier(varName))], j.literal(importPath)),
        )
      })

      importDeclaration.specifiers = importDeclaration.specifiers?.filter((n) => n.type !== 'ImportSpecifier')

      if (importDeclaration.specifiers?.length === 0) j(path).remove()
    })
    .toSource()

  return result
}
