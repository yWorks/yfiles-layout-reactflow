import {
  LayoutDescriptor,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  MinimumNodeSizeStage
} from '@yfiles/yfiles'
import { getLayoutAlgorithm } from './layout-algorithms.ts'
import { LayoutAlgorithmConfiguration } from './layout-types.ts'

let license: Record<string, unknown> | null = null

/**
 * Sets the license to be used for initializing web workers.
 */
export function setWebWorkerLicense(licensePar: Record<string, unknown>) {
  license = licensePar
}

/**
 * Waits for the Web Worker to ready up and sends the license to it.
 * Returns a promise that resolves to the worker once the worker has sent
 * a 'licensed' message.
 *
 * Every worker should therefore include the following or similar code
 * at the beginning of its message handler:
 *
 * ```tsx
 * if (e.data.license) {
 *   License.value = e.data.license
 *   postMessage('licensed')
 *   return
 * }
 * ```
 *
 */
export function registerWebWorker(worker: Worker): Promise<Worker> {
  if (license === null) {
    throw new Error('License not initialized.')
  }

  return new Promise(resolve => {
    worker.onmessage = event => {
      if (event.data === 'ready') {
        worker.postMessage({
          license
        })
      } else if (event.data === 'licensed') {
        resolve(worker)
      }
    }

    // check if worker is already alive and ready, e.g. when switching between component instances
    // with and without worker support, but without terminating the worker
    worker.postMessage('check-is-ready')
  })
}

/**
 * Initializes a Web Worker for the layout calculation.
 *
 * For example, this function can be used in a Web Worker for asynchronous layout calculation.
 *
 * ```tsx
 * // LayoutWorker.ts
 * import { initializeWebWorker } from '@yworks/yfiles-layout-reactflow/WebWorkerSupport'
 * initializeWebWorker(self)
 * ```
 *
 * ```tsx
 * // index.tsx
 * const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
 *   type: 'module'
 * })
 *
 * const LayoutFlow = () => {
 *   const [nodes] = useNodesState(initialNodes)
 *   const [edges] = useEdgesState(initialEdges)
 *
 *   const { runLayout } = useLayout({ layoutWorker })
 *
 *   return (
 *     <ReactFlow>
 *       <Panel position="top-left">
 *         <button onClick={() => runLayout('HierarchicalLayout')}>Layout</button>
 *       </Panel>
 *     </ReactFlow>
 *   )
 * }
 *
 * export default function Flow() {
 *   return (
 *     <ReactFlowProvider>
 *       <LayoutFlow />
 *     </ReactFlowProvider>
 *   )
 * }
 * ```
 * @param self - The current worker
 */
export function initializeWebWorker(self: Window) {
  self.addEventListener(
    'message',
    e => {
      if (e.data.license) {
        License.value = e.data.license
        self.postMessage('licensed')
        return
      }

      if (e.data === 'check-is-ready') {
        // signal that the Web Worker thread is ready to execute
        self.postMessage('ready')
        return
      }

      new LayoutExecutorAsyncWorker(applyLayout)
        .process(e.data)
        .then(data => {
          self.postMessage(data)
        })
        .catch(errorObj => {
          self.postMessage(errorObj)
        })
    },
    false
  )

  // signal that the Web Worker thread is ready to execute
  self.postMessage('ready')
}

async function applyLayout(graph: LayoutGraph, layoutDescriptor: LayoutDescriptor): Promise<void> {
  const layout = await getLayoutAlgorithm(layoutDescriptor as LayoutAlgorithmConfiguration)
  new MinimumNodeSizeStage(layout).applyLayout(graph)
}
