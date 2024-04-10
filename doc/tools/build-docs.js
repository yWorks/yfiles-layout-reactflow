import { cleanup } from './cleanup.js'
import { generateDocs } from './generate-docs.js'

const componentName = 'yfiles-layout-reactflow'

cleanup()
generateDocs(componentName, {})
