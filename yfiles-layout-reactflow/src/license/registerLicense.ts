import { Graph, License } from '@yfiles/yfiles'
import { setWebWorkerLicense } from '../layout/WebWorkerSupport.ts'

/**
 * Registers the [yFiles license]{@link http://docs.yworks.com/yfileshtml/#/dguide/licensing} which is needed to
 * use the {@link useLayout} hook or the {@link useLayoutSupport} hook which are based on [yFiles for HTML]{@link https://www.yworks.com/products/yfiles-for-html}.
 *
 * ```tsx
 * function App() {
 *   registerLicense(yFilesLicense)
 *
 *   const { runLayout } = useLayout()
 *
 *   return (
 *     <ReactFlow></ReactFlow>
 *   )
 * }
 * ```
 *
 * @param licenseKey - The license key to register
 */
export function registerLicense(licenseKey: Record<string, unknown>) {
  License.value = licenseKey
  setWebWorkerLicense(licenseKey)
}

/**
 * Checks whether there is a valid yfiles license registered.
 */
export function checkLicense() {
  const g = new Graph()
  g.createNode()

  if (g.nodes.size !== 1) {
    console.error(
      'yFiles Layout Algorithms for React Flow requires a valid yFiles for HTML license. You can evaluate yFiles for 60 days free of charge on my.yworks.com.'
    )
    return false
  }
  return true
}
