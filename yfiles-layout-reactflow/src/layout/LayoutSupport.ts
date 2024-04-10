import { GraphComponent, IGraph, LayoutExecutor, LayoutExecutorAsync } from 'yfiles'
import { getLayoutAlgorithm, getLayoutData } from './layout-algorithms.ts'
import { LayoutAlgorithmConfiguration, LayoutDataProvider } from './layout-types.ts'
import { registerWebWorker } from './WebWorkerSupport.ts'

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
    reactFlowElement?: HTMLDivElement
  ): Promise<void> {
    const executor =
      this.workerPromise !== null
        ? await this.createLayoutExecutorAsync(
            graph,
            layoutConfiguration,
            layoutDataProvider,
            reactFlowElement
          )
        : await this.createLayoutExecutor(
            graph,
            layoutConfiguration,
            layoutDataProvider,
            reactFlowElement
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
    reactFlowElement?: HTMLDivElement
  ): Promise<LayoutExecutor> {
    const layoutAlgorithm = await getLayoutAlgorithm(layoutConfiguration)
    return Promise.resolve(
      new LayoutExecutor({
        graphComponent: new GraphComponent({ graph }),
        layout: layoutAlgorithm,
        layoutData: getLayoutData(layoutConfiguration.name, layoutDataProvider, reactFlowElement)
      })
    )
  }

  private async createLayoutExecutorAsync<TNodeData, TEdgeData>(
    graph: IGraph,
    layoutConfiguration: LayoutAlgorithmConfiguration,
    layoutDataProvider?: LayoutDataProvider<TNodeData, TEdgeData>,
    reactFlowElement?: HTMLDivElement
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
      layoutData: getLayoutData(layoutConfiguration.name, layoutDataProvider, reactFlowElement)
    })
    return this.executor
  }
}
