import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import fs from 'fs-extra'
import prettier from '@prettier/sync'

export function generateDocs(componentName, config) {
  // extract api
  function extractApiJson() {
    const apiExtractorJsonPath = `./tools/config/api-extractor.json`

    // Load and parse the api-extractor.json file
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)

    // Invoke API Extractor
    const extractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,

      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: true
    })

    if (extractorResult.succeeded) {
      console.log(`API Extractor completed successfully`)
      process.exitCode = 0
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      )
      process.exitCode = 1
    }
  }

  /**
   * Replaces excessive whitespace and newlines with single blanks
   */
  function removeWhitespace(text) {
    return text.replace(/\s+/g, ' ')
  }

  /**
   * Gets the excerpt tokens in the given range
   */
  function getExcerptTokens(member, tokenRange) {
    const startIndex = tokenRange.startIndex
    const endIndex = tokenRange.endIndex
    return member.excerptTokens.slice(startIndex, endIndex)
  }

  /**
   * Checks whether the given function returns a JSX Element.
   */
  function returnsJSXElement(functionMember) {
    const tokenRange = getExcerptTokens(functionMember, functionMember.returnTypeTokenRange)
    return tokenRange.some(
      token => token.canonicalReference === '@types/react!JSX.Element:interface'
    )
  }

  function isHOCFunction(member) {
    const tokenRange = getExcerptTokens(member, member.variableTypeTokenRange)
    return (
      tokenRange[tokenRange.length - 1].canonicalReference === '@types/react!JSX.Element:interface'
    )
  }

  function writeFile(filePath, content) {
    fs.ensureFileSync(filePath)
    fs.writeFileSync(filePath, content)
  }

  function getParamComment(docComment, parameterName) {
    const regex = new RegExp(`@param ${parameterName}\\s*-*\\s*([^\\n]*)`)
    const match = docComment.match(regex)
    return match ? match[1] : null
  }

  function getReturnsComment(docComment) {
    const regex = new RegExp(`@returns ([^\\n]*)`)
    const match = docComment.match(regex)
    return match ? 'Returns ' + match[1] : null
  }

  function toPascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }

  const mainComponents = new Set(config['mainComponents'] ?? [])

  // generate markdown
  function generateMarkdown() {
    const apiJSON = JSON.parse(
      fs.readFileSync(`./build/${componentName}-api.json`, { encoding: 'utf8', flag: 'r' })
    )

    // all exported members, including react components, interfaces, hooks and functions
    const allMembers = apiJSON.members.flatMap(member => member.members)
    // all react components
    const reactComponents = allMembers.filter(
      member => member.kind === 'Function' && returnsJSXElement(member)
    )
    const hocs = allMembers.filter(member => member.kind === 'Variable' && isHOCFunction(member))

    // all exported interfaces that are not component props
    const interfaces = allMembers.filter(member => member.kind === 'Interface')
    // all exported types
    const types = allMembers.filter(member => member.kind === 'TypeAlias')
    const hooks = allMembers.filter(
      member => member.kind === 'Function' && member.name.startsWith('use')
    )
    const functions = allMembers.filter(
      member =>
        member.kind === 'Function' &&
        hooks.indexOf(member) === -1 &&
        reactComponents.indexOf(member) === -1
    )

    /**
     * Returns the relative URL to the member with the given name, or null if no member with this name exists.
     */
    function getMemberUrl(linkText, origin) {
      const memberName = linkText.split('.')[0]
      if (
        reactComponents.find(member => member.name === memberName) ||
        hocs.find(member => member.name === memberName)
      ) {
        return resolvePath([reactComponents, hocs], origin, linkText, 'components')
      }
      if (
        interfaces.find(member => member.name === memberName) ||
        types.find(member => member.name === memberName)
      ) {
        return resolvePath([interfaces, types], origin, linkText, 'types')
      }
      if (hooks.find(member => member.name === memberName)) {
        return resolvePath([hooks], origin, linkText, 'hooks')
      }
      if (functions.find(member => member.name === memberName)) {
        return resolvePath([functions], origin, linkText, 'functions')
      }
      return null
    }

    function resolvePath(sourceDirs, origin, linkText, targetName) {
      if (sourceDirs.some(dir => dir.find(member => member.name === origin))) {
        return `${linkText.replace('.', '#').toLowerCase()}`
      }
      return `../${targetName}/${linkText.replace('.', '#').toLowerCase()}`
    }

    function processDocComment(docComment, origin, removeLinebreaks) {
      let doc = docComment

      if (!doc) {
        console.warn(`Doc comment is missing for ${origin}`)
        return ''
      }

      // replace links
      const namedLinkMatches = doc.matchAll(/\[([\w\s]*)]{@link ([^}]+)}/g)
      for (let match of namedLinkMatches) {
        const oldTarget = match[2]
        const newTarget = getMemberUrl(oldTarget, origin)
        doc = doc.replace(match[0], `[${match[1]}](${newTarget || oldTarget})`)
      }
      const unnamedLinkMatches = doc.matchAll(/{@link ([^}]+)}/g)
      for (let match of unnamedLinkMatches) {
        const oldTarget = match[1]
        const newTarget = getMemberUrl(oldTarget, origin)
        doc = doc.replace(match[0], `[${match[1]}](${newTarget || oldTarget})`)
      }
      // remove * from code snippets to keep the idents and line breaks intact
      const codeSnippets = doc.matchAll(/\*\s*(```([^`]+)```)/g)
      for (let match of codeSnippets) {
        doc = doc.replace(match[0], match[1].replaceAll(/\n\s*\*/g, '\n'))
      }

      // remove comments, whitespace and @param
      return doc
        .replace(/\s*\/\*\*\s*/, '')
        .replace(/\s*\*\/\s*/, '')
        .replace(/@param\s+(\w+)\s*-?\s*[^\r\n]*/, '')
        .replace(/@returns\s*[^\r\n]*/, '')
        .split(/\s*\*\s*\/?/g)
        .join(removeLinebreaks ? ' ' : '\n')
    }

    function excerptTokenToString(token, origin, refMap) {
      if (token.kind === 'Reference') {
        if (token.canonicalReference.startsWith('@reactflow')) {
          const memberName = token.canonicalReference.substring(
            token.canonicalReference.indexOf('!') + 1,
            token.canonicalReference.indexOf(':')
          )
          const refId = `Ref_${memberName}_${(Math.random() * 1000) | 0}`
          refMap.set(
            refId,
            `[${memberName}](https://reactflow.dev/api-reference/types/${memberName
              .split(/(?=[A-Z])/)
              .join('-')
              .toLowerCase()})`
          )
          return refId
        } else if (token.canonicalReference.startsWith('yfiles')) {
          const memberName = token.text
          const refId = `Ref_${memberName}_${(Math.random() * 1000) | 0}`
          refMap.set(
            refId,
            `[${memberName}](https://docs.yworks.com/yfileshtml/#/api/${memberName})`
          )
          return refId
        } else {
          const memberName = token.text
          const url = getMemberUrl(token.text, origin)
          if (url) {
            const refId = `Ref_${memberName}_${(Math.random() * 1000) | 0}`
            refMap.set(refId, `[${memberName}](${url})`)
            return refId
          }
        }
      }
      return removeWhitespace(token.text)
    }

    /**
     * Converts the given excerpt tokens to a string
     * The linked types are replaced with placeholders. The mapping to the original types are stored
     * in the refMap.
     */
    function excerptTokensToString(tokens, origin, refMap) {
      return tokens.map(token => excerptTokenToString(token, origin, refMap)).join('')
    }

    /**
     * Runs prettier on the given type string and replaces the refs with the markdown links.
     */
    function prettifyType(typeString, refMap) {
      const prefix = 'let x : () =>'
      let formattedTypeString = prettier.format(`${prefix}${typeString}`, {
        parser: 'typescript',
        semi: false,
        printWidth: 40,
        trailingComma: 'none'
      })
      refMap.forEach((value, key) => {
        formattedTypeString = formattedTypeString.replace(key, value)
      })
      return formattedTypeString
        .substring(prefix.length)
        .replace(/^( +)\| /, '')
        .replaceAll('|', '&#124;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .trim()
        .replace(/\r?\n/g, '<br>')
    }

    function getPropertyType(member, origin) {
      const tokens = getExcerptTokens(member, member.propertyTypeTokenRange, origin)
      const refMap = new Map()
      const typeString = prettifyType(excerptTokensToString(tokens, origin, refMap), refMap)
      return `<pre>${typeString}</pre>`
    }

    function getMethodType(member, origin) {
      const refMap = new Map()
      const parameters = member.parameters.map(param => {
        const typeTokens = getExcerptTokens(member, param.parameterTypeTokenRange)
        const typeString = excerptTokensToString(typeTokens, origin, refMap)
        return `${param.parameterName}: ${typeString}`
      })
      const returnTypeTokens = getExcerptTokens(member, member.returnTypeTokenRange)
      const returnTypeString = excerptTokensToString(returnTypeTokens, origin, refMap)
      const paramsString = `${parameters.join(', ')}`
      const methodTypeString = prettifyType(`(${paramsString}) => ${returnTypeString}`, refMap)
      return `<pre>${methodTypeString}</pre>`
    }

    /**
     * Gets the stringified type of a given member
     */
    function getTypeString(member, origin) {
      switch (member.kind) {
        case 'PropertySignature':
          return getPropertyType(member, origin)
        case 'MethodSignature':
          return getMethodType(member, origin)
        default:
          return 'unknown'
      }
    }

    function getTypeParametersString(member, origin) {
      if (member.typeParameters) {
        const tNames = member.typeParameters
          .map(param => {
            let name = param.typeParameterName
            // we handle only simple cases like <TItem extends Item>
            if (param.constraintTokenRange.endIndex - param.constraintTokenRange.startIndex === 1) {
              const excerptTokens = getExcerptTokens(member, param.constraintTokenRange).filter(
                token => token.kind === 'Reference'
              )
              if (excerptTokens.length > 0) {
                const superType = excerptTokens[0].text
                if (superType && superType !== '') {
                  const typeUrl = getMemberUrl(superType, origin)
                  name += ` extends <a href="${typeUrl}">${superType}</a>`
                }
              }
            }
            return name
          })
          .join(', ')
        return `&lt;${tNames}&gt;`
      }
      return ''
    }

    function getFunctionParameterTypeString(func, parameter, origin) {
      if (parameter.parameterTypeTokenRange) {
        const tokens = getExcerptTokens(func, parameter.parameterTypeTokenRange)
        const refMap = new Map()
        return prettifyType(excerptTokensToString(tokens, origin, refMap), refMap)
      }
      return ''
    }

    const reactComponentPropTypes = reactComponents.reduce((map, component) => {
      const propsParameter = component.parameters[0]
      const typeTokens = getExcerptTokens(component, propsParameter.parameterTypeTokenRange).filter(
        token => token.kind === 'Reference'
      )
      const componentPropsTypes = typeTokens
        .map(token => interfaces.find(type => type.name === token.text))
        .filter(type => !!type)
      map.set(component.name, componentPropsTypes)
      return map
    }, new Map())

    const propsHeader = `| Name | Description | Type |
|---|---|---|`

    const parametersHeader = `| Name | Description | Type |
|---|---|---|`

    const returnsHeader = `| Type | Description | 
|---|---|`

    const typeHeader = `| Type | | 
|---|---|`

    // process react components
    reactComponents.forEach(component => {
      const componentPropsTypes = reactComponentPropTypes.get(component.name)
      const propsMembersTable =
        componentPropsTypes.length > 0 &&
        componentPropsTypes[0].members
          ?.map(
            member =>
              `| <div id="${member.name.toLowerCase()}">${member.name}${
                member.isOptional ? '?' : ''
              }</div> | ${processDocComment(
                member.docComment,
                component.name,
                true
              )} | ${getTypeString(member, component.name)} |`
          )
          .join('\n')

      let markdown = `---
title: ${component.name}
tags: ['TODO']${mainComponents.has(component.name) ? '\nmainComponent: true' : ''}
---
## ${component.name}${getTypeParametersString(component, component.name)}

${processDocComment(component.docComment, component.name)}`

      if (propsMembersTable) {
        markdown += `
### Props

<div class="table-container">

${propsHeader}
${propsMembersTable}

</div>
    `
      }

      writeFile(`./src/content/components/${component.name}.md`, markdown)
    })

    // process higher order components
    hocs.forEach(component => {
      const markdown = `---
title: ${component.name}
tags: ['TODO']${mainComponents.has(component.name) ? '\nmainComponent: true' : ''}
---
## ${component.name}

${processDocComment(component.docComment, component.name)}`
      writeFile(`./src/content/components/${component.name}.md`, markdown)
    })

    // process interfaces
    interfaces.forEach(interfaceType => {
      const membersTable = interfaceType.members
        .map(
          member =>
            `| <div id="${member.name.toLowerCase()}">${member.name}${
              member.isOptional ? '?' : ''
            }</div> | ${processDocComment(
              member.docComment,
              interfaceType.name,
              true
            )} | ${getTypeString(member, interfaceType.name)} |`
        )
        .join('\n')

      const markdown = `---
title: ${interfaceType.name}
tags: ['TODO']
---
## ${interfaceType.name}${getTypeParametersString(interfaceType, interfaceType.name)}

${processDocComment(interfaceType.docComment, interfaceType.name)}

### Props
    
${propsHeader}
${membersTable}
    `

      writeFile(`./src/content/types/${interfaceType.name}.md`, markdown)
    })

    // process type aliases
    types.forEach(typeAlias => {
      const typeTokens = getExcerptTokens(typeAlias, typeAlias.typeTokenRange)
      const refMap = new Map()
      const typeString = prettifyType(
        excerptTokensToString(typeTokens, typeAlias.name, refMap),
        refMap
      )

      const markdown = `---
title: ${typeAlias.name}
tags: ['TODO']
---
## ${typeAlias.name}${getTypeParametersString(typeAlias, typeAlias.name)}

${processDocComment(typeAlias.docComment, typeAlias.name)}

${typeHeader}
|         | <pre>${typeString}</pre> |`

      writeFile(`./src/content/types/${typeAlias.name}.md`, markdown)
    })

    // process hooks
    hooks.forEach(hook => {
      const returnTypeTokens = getExcerptTokens(hook, hook.returnTypeTokenRange)
      const refMap = new Map()
      const returnTypeString = prettifyType(
        excerptTokensToString(returnTypeTokens, hook.name, refMap),
        refMap
      )
      const returnComment = getReturnsComment(hook.docComment)
      const parametersTable = hook.parameters
        .map(
          param =>
            `| <div id="${param.parameterName.toLowerCase()}">${param.parameterName}${
              param.isOptional ? '?' : ''
            }</div> | ${getParamComment(
              hook.docComment,
              param.parameterName
            )} | <pre>${getFunctionParameterTypeString(hook, param, hook.name)}</pre>`
        )
        .join('\n')

      let markdown = `---
title: ${hook.name}
tags: ['TODO']
---
## ${hook.name}

${processDocComment(hook.docComment, hook.name)}`
      if (parametersTable) {
        markdown += `
      
### Parameters
${parametersHeader}
${parametersTable}`
      }

      if (returnTypeString !== 'void') {
        markdown += `

### Returns
${returnsHeader}
| <pre>${returnTypeString}</pre> | ${processDocComment(returnComment)} |`
      }

      writeFile(`./src/content/hooks/${hook.name}.md`, markdown)
    })

    // process functions
    functions.forEach(func => {
      const returnTypeTokens = getExcerptTokens(func, func.returnTypeTokenRange)
      const refMap = new Map()
      const returnTypeString = prettifyType(
        excerptTokensToString(returnTypeTokens, func.name, refMap),
        refMap
      )
      const returnsComment = getReturnsComment(func.docComment)
      const parametersTable = func.parameters
        .map(
          param =>
            `| <div id="${param.parameterName.toLowerCase()}">${param.parameterName}${
              param.isOptional ? '?' : ''
            }</div> | ${getParamComment(
              func.docComment,
              param.parameterName
            )} | <pre>${getFunctionParameterTypeString(func, param, func.name)}</pre>`
        )
        .join('\n')

      let markdown = `---
title: ${func.name}
tags: ['TODO']
---
## ${func.name}()

${processDocComment(func.docComment, func.name)}
`

      if (parametersTable) {
        markdown += `
      
### Parameters
${parametersHeader}
${parametersTable}`
      }

      if (returnTypeString !== 'void') {
        markdown += `
      
### Returns
${returnsHeader}
| <pre>${returnTypeString}</pre> | ${processDocComment(returnsComment)} |`
      }

      writeFile(`./src/content/functions/${func.name}.md`, markdown)
    })
  }

  extractApiJson()
  generateMarkdown()
}
