import { GraphComponent, IGraph, LayoutExecutor, LayoutExecutorAsync } from '@yfiles/yfiles'
import { getLayoutAlgorithm, getLayoutData } from './layout-algorithms.ts'
import { LayoutAlgorithmConfiguration, LayoutDataProvider } from './layout-types.ts'
import { registerWebWorker } from './WebWorkerSupport.ts'
import { RefObject } from 'react'

export class LayoutSupport {
  private readonly workerPromise: Promise<Worker> | null = null
  private executor: LayoutExecutorAsync | null = null

  constructor(layoutWorker?: Worker) {
    if (layoutWorker) {
      this.workerPromise = registerWebWorker(layoutWorker)
    }
  }

  async applyLayout<TNodeData, TEdgeData>(
    graph: IGraph,
    layoutConfiguration: LayoutAlgorithmConfiguration,
    layoutDataProvider?: LayoutDataProvider<TNodeData, TEdgeData>,
    reactFlowRef?: RefObject<HTMLDivElement>
  ): Promise<void> {
    const executor =
      this.workerPromise !== null
        ? await this.createLayoutExecutorAsync(
            graph,
            layoutConfiguration,
            layoutDataProvider,
            reactFlowRef
          )
        : await this.createLayoutExecutor(
            graph,
            layoutConfiguration,
            layoutDataProvider,
            reactFlowRef
          )

    try {
      await executor.start()
    } catch (e) {
      if ((e as Record<string, unknown>).name === 'AlgorithmAbortedError') {
        console.error('Layout calculation was aborted because maximum duration time was exceeded.')
      } else {
        console.error('Something went wrong during the layout calculation')
        console.error(e)
      }
    }
  }

  private async createLayoutExecutor<TNodeData, TEdgeData>(
    graph: IGraph,
    layoutConfiguration: LayoutAlgorithmConfiguration,
    layoutDataProvider?: LayoutDataProvider<TNodeData, TEdgeData>,
    reactFlowRef?: RefObject<HTMLDivElement>
  ): Promise<LayoutExecutor> {
    const layoutAlgorithm = await getLayoutAlgorithm(layoutConfiguration)
    return Promise.resolve(
      new LayoutExecutor({
        graphComponent: new GraphComponent({ graph }),
        layout: layoutAlgorithm,
        layoutData: getLayoutData(layoutConfiguration.name, layoutDataProvider, reactFlowRef)
      })
    )
  }

  private async createLayoutExecutorAsync<TNodeData, TEdgeData>(
    graph: IGraph,
    layoutConfiguration: LayoutAlgorithmConfiguration,
    layoutDataProvider?: LayoutDataProvider<TNodeData, TEdgeData>,
    reactFlowRef?: RefObject<HTMLDivElement>
  ): Promise<LayoutExecutorAsync> {
    if (this.executor) {
      await this.executor.cancel()
    }
    const worker = await this.workerPromise!

    // helper function that performs the actual message passing to the web worker
    const webWorkerMessageHandler = (data: object): Promise<object> => {
      // keep track of the requested layout, to ignore stale layouts
      const thisRequest = (data as { token: string }).token
      return new Promise((resolve, reject) => {
        worker.onmessage = e => {
          // don't resolve cancelled requests
          if (e.data && thisRequest === e.data.token) {
            if (e.data.name === 'AlgorithmAbortedError') {
              reject(e.data)
            } else {
              resolve(e.data)
            }
          }
        }

        worker.postMessage(data)
      })
    }

    this.executor = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graph,
      layoutDescriptor: layoutConfiguration,
      layoutData: getLayoutData(layoutConfiguration.name, layoutDataProvider, reactFlowRef)
    })
    return this.executor
  }
}
