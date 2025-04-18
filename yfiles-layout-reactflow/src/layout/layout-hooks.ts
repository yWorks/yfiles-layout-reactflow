import { RefObject, useCallback, useEffect, useMemo, useState } from 'react'
import {
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  Graph,
  GraphBuilder,
  GroupingSupport,
  IEdge,
  IGraph,
  Matrix,
  OrientedRectangle,
  Point,
  Rect,
  Size
} from '@yfiles/yfiles'
import {
  Edge,
  EdgeProps,
  Node,
  NodeProps,
  Position,
  useNodesInitialized,
  useReactFlow
} from 'reactflow'
import {
  CircularLayoutDataProvider,
  EdgeRouterDataProvider,
  GenericLabelingDataProvider,
  HierarchicalLayoutDataProvider,
  LayoutAlgorithmConfiguration,
  LayoutDataProvider,
  LayoutName,
  OrganicLayoutDataProvider,
  OrthogonalLayoutDataProvider,
  RadialLayoutDataProvider,
  RadialTreeLayoutDataProvider,
  TreeLayoutDataProvider
} from './layout-types.ts'
import { checkLicense } from '../license/registerLicense.ts'
import { LayoutSupport as LayoutExecutor } from './LayoutSupport.ts'
import {
  CircularLayoutOptions,
  EdgeRouterOptions,
  GenericLabelingOptions,
  HierarchicalLayoutOptions,
  LayoutAlgorithmOptions,
  OrganicLayoutOptions,
  OrthogonalLayoutOptions,
  RadialLayoutOptions,
  RadialTreeLayoutOptions,
  TreeLayoutOptions
} from './layout-options-types.ts'
import { getRootNode } from './layout-algorithms.ts'

/**
 * Context information for running a layout algorithm.
 */
export interface LayoutContext {
  /** A Web Worker for asynchronous layout calculation. */
  layoutWorker?: Worker
  /**
   * An optional reference to the React Flow element. This reference is particularly useful in scenarios where there
   * are multiple React Flow elements on the same page or when the flow is encapsulated within a closed shadow DOM.
   */
  reactFlowRef?: RefObject<HTMLDivElement>
  /**
   * A callback function invoked when an error occurs during the layout process.
   * It allows developers to handle errors and perform necessary actions when layout errors occur.
   */
  onError?: (error: unknown) => void
}

/**
 * The layout configuration is an object consisting of the layout name, and optionally, the layout options
 * for the selected layout algorithm and the layout data provider.
 */
export type LayoutConfiguration<
  LayoutType = LayoutName,
  TNodeData = NodeProps,
  TEdgeData = EdgeProps
> = LayoutType extends 'HierarchicalLayout'
  ? {
      name: LayoutType
      layoutOptions?: HierarchicalLayoutOptions
      layoutData?: HierarchicalLayoutDataProvider<TNodeData, TEdgeData>
    }
  : LayoutType extends 'OrthogonalLayout'
    ? {
        name: LayoutType
        layoutOptions?: OrthogonalLayoutOptions
        layoutData?: OrthogonalLayoutDataProvider<TNodeData, TEdgeData>
      }
    : LayoutType extends 'RadialLayout'
      ? {
          name: LayoutType
          layoutOptions?: RadialLayoutOptions
          layoutData?: RadialLayoutDataProvider<TNodeData, TEdgeData>
        }
      : LayoutType extends 'CircularLayout'
        ? {
            name: LayoutType
            layoutOptions?: CircularLayoutOptions
            layoutData?: CircularLayoutDataProvider<TNodeData, TEdgeData>
          }
        : LayoutType extends 'OrganicLayout'
          ? {
              name: LayoutType
              layoutOptions?: OrganicLayoutOptions
              layoutData?: OrganicLayoutDataProvider<TNodeData, TEdgeData>
            }
          : LayoutType extends 'TreeLayout'
            ? {
                name: LayoutType
                layoutOptions?: TreeLayoutOptions
                layoutData?: TreeLayoutDataProvider<TNodeData, TEdgeData>
              }
            : LayoutType extends 'RadialTreeLayout'
              ? {
                  name: LayoutType
                  layoutOptions?: RadialTreeLayoutOptions
                  layoutData?: RadialTreeLayoutDataProvider<TNodeData, TEdgeData>
                }
              : LayoutType extends 'EdgeRouter'
                ? {
                    name: LayoutType
                    layoutOptions?: EdgeRouterOptions
                    layoutData?: EdgeRouterDataProvider<TNodeData, TEdgeData>
                  }
                : LayoutType extends 'GenericLabeling'
                  ? {
                      name: LayoutType
                      layoutOptions?: GenericLabelingOptions
                      layoutData?: GenericLabelingDataProvider
                    }
                  : {
                      name: LayoutType
                      layoutOptions?: undefined
                      layoutData?: undefined
                    }

/**
 * A React hook that provides a callback to invoke the configured layout algorithm on the given data.
 *
 * ```tsx
 * const edgeTypes = {
 *   default: PolylineEdge
 * }
 *
 * const nodeTypes = {
 *   default: MultiHandleNode
 * }
 *
 * const LayoutFlow = () => {
 *   const [nodes] = useNodesState(initialNodes)
 *   const [edges] = useEdgesState(initialEdges)
 *
 *   const { runLayout, running } = useLayout()
 *
 *   return (
 *     <ReactFlow
 *       nodes={nodes}
 *       edges={edges}
 *       nodeTypes={nodeTypes}
 *       edgeTypes={edgeTypes}
 *     >
 *       <Panel position="top-right">
 *         <button onClick={() => runLayout('OrthogonalLayout')} disabled={running}>Orthogonal Layout</button>
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
 *
 * @param context - The context information for running the layout algorithm.
 * @returns a function to invoke the layout algorithm and a running state that indicates whether a layout is currently calculated.
 */
export function useLayout<
  TNodeData extends NodeProps = NodeProps,
  TEdgeData extends EdgeProps = EdgeProps
>(
  context?: LayoutContext
): { runLayout: (configuration: LayoutConfiguration | LayoutName) => void; running: boolean } {
  const { fitView, getZoom, getNodes, setNodes, getEdges, setEdges } = useReactFlow()

  const [running, setRunning] = useState(false)

  const layoutSupport = useMemo(() => {
    return new LayoutExecutor(context?.layoutWorker)
  }, [context?.layoutWorker])

  return {
    runLayout: useCallback(
      (configuration: LayoutConfiguration | LayoutName) => {
        if (!checkLicense()) {
          return
        }

        setRunning(true)
        const graph = buildGraph(getNodes(), getEdges(), getZoom(), context?.reactFlowRef)
        const { name, layoutOptions, layoutData } = getConfiguration<TNodeData, TEdgeData>(
          configuration
        )

        layoutSupport
          .applyLayout(
            graph,
            { name, properties: layoutOptions } as LayoutAlgorithmConfiguration,
            layoutData,
            context?.reactFlowRef
          )
          .then(() => {
            const { arrangedNodes, arrangedEdges } = transferLayout(graph, context?.reactFlowRef)
            setNodes(arrangedNodes)
            setEdges(arrangedEdges)
            setTimeout(() => fitView())
          })
          .catch((e: unknown) => {
            context?.onError?.(e)
          })
          .finally(() => {
            setRunning(false)
          })
      },
      [getNodes, getEdges, getZoom, context, layoutSupport, setNodes, setEdges, fitView]
    ),
    running: running
  }
}

/**
 * Contains helper functions to transfer node and edge data to a layout graph and back.
 */
export interface LayoutSupport {
  /**
   * Creates a graph from the given data that can be arranged by a yFiles layout algorithm.
   */
  buildGraph: (nodes: Node[], edges: Edge[], zoom: number) => IGraph

  /**
   * Transfers the calculated layout from the graph to lists of nodes and edges.
   */
  transferLayout: (graph: IGraph) => { arrangedNodes: Node[]; arrangedEdges: Edge[] }
}

/**
 * A React hook that provides helper function that prepare the data for the layout algorithm and
 * retrieve the result.
 *
 * This hook is tailored for users interested in delving into [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html),
 * exploring various layout algorithms, and crafting advanced layout code for their applications.
 *
 * ```tsx
 * const edgeTypes = {
 *   default: PolylineEdge
 * }
 *
 * const nodeTypes = {
 *   default: MultiHandleNode
 * }
 *
 * const LayoutFlow = () => {
 *   const [nodes, setNodes] = useNodesState(initialNodes)
 *   const [edges, setEdges] = useEdgesState(initialEdges)
 *   const { fitView, getZoom } = useReactFlow()
 *
 *   const { buildGraph, transferLayout } = useLayoutSupport()
 *
 *   const runLayout = useCallback(() => {
 *     // create a graph from data
 *     const graph = buildGraph(nodes, edges, getZoom())
 *
 *     // configure a layout
 *     const hierarchicalLayout = new HierarchicalLayout()
 *     const hierarchicalLayoutData = new HierarchicalLayoutData({
 *       ports: {
 *         sourcePortCandidates: (edge: IEdge) => {
 *           const candidates = new EdgePortCandidates()
 *           if (edge.tag.id === 'e0') {
 *             candidates.addFreeCandidate(PortSides.LEFT)
 *           } else if (edge.tag.id === 'e1') {
 *             candidates.addFreeCandidate(PortSides.RIGHT)
 *           } else {
 *             candidates.addFreeCandidate(PortSides.START_IN_FLOW)
 *           }
 *           return candidates
 *         }
 *       }
 *     })
 *
 *     // apply the layout
 *     graph.applyLayout(hierarchicalLayout, hierarchicalLayoutData)
 *
 *     // transfer the new coordinates to the data
 *     const { arrangedEdges, arrangedNodes } = transferLayout(graph)
 *     setNodes(arrangedNodes)
 *     setEdges(arrangedEdges)
 *
 *     // fit the graph into the view
 *     window.requestAnimationFrame(() => fitView())
 *   }, [nodes, edges, buildGraph, transferLayout, setNodes, setEdges, fitView, getZoom])
 *
 *   return (
 *     <ReactFlow
 *       nodes={nodes}
 *       edges={edges}
 *       nodeTypes={nodeTypes}
 *       edgeTypes={edgeTypes}
 *     >
 *       <Panel position="top-right">
 *         <button onClick={runLayout}>Layout</button>
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
 * @param {RefObject<HTMLElement>}[reactFlowRef] An optional reference to the React Flow element. This reference is
 * particularly useful in scenarios where there are multiple React Flow elements on the same page or when the flow is
 * encapsulated within a closed shadow DOM.
 * @returns functions to transfer the data into a graph and get the layout information from the graph.
 */
export function useLayoutSupport(reactFlowRef?: RefObject<HTMLElement>): LayoutSupport {
  return {
    buildGraph: useCallback(
      (nodes, edges, zoom) => buildGraph(nodes, edges, zoom, reactFlowRef),
      [reactFlowRef]
    ),
    transferLayout: useCallback(graph => transferLayout(graph, reactFlowRef), [reactFlowRef])
  }
}

/**
 * A React hook that executes the given callback when all nodes are measured by React Flow and have a size.
 *
 * ```tsx
 * const edgeTypes = {
 *   default: PolylineEdge
 * }
 *
 * const nodeTypes = {
 *   default: MultiHandleNode
 * }
 *
 * const LayoutFlow = () => {
 *   const [nodes] = useNodesState(initialNodes)
 *   const [edges] = useEdgesState(initialEdges)
 *
 *   const { runLayout, running } = useLayout()
 *
 *   // run initial layout after the nodes have been measured
 *   useNodesMeasuredEffect(() => {
 *     runLayout('OrthogonalLayout')
 *   })
 *
 *   return (
 *     <ReactFlow
 *       nodes={nodes}
 *       edges={edges}
 *       nodeTypes={nodeTypes}
 *       edgeTypes={edgeTypes}
 *     ></ReactFlow>
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
 *
 * @param callback - A callback that is invoked when all nodes are measured.
 */
export function useNodesMeasuredEffect(callback: () => void): void {
  const { getNodes } = useReactFlow()
  const [shouldLayout, setShouldLayout] = useState<boolean>(true)
  const nodesInitialized = useNodesInitialized({
    includeHiddenNodes: false
  })

  return useEffect(() => {
    const nodes = getNodes()

    // make sure that the callback is only executed once
    if (
      nodesInitialized &&
      shouldLayout &&
      nodes.every(node => typeof node.width !== 'undefined' && typeof node.height !== 'undefined')
    ) {
      setShouldLayout(false)
      callback()
    }
  }, [getNodes, shouldLayout, callback, nodesInitialized])
}

function buildGraph(
  nodes: Node[],
  edges: Edge[],
  zoom: number,
  reactFlowRef?: RefObject<HTMLElement>
): IGraph {
  if (!checkLicense()) {
    return new Graph()
  }

  const builder = new GraphBuilder()
  const nodesSource = builder.createNodesSource({
    data: nodes,
    id: node => node.id,
    parentId: node => node.parentNode,
    layout: node => Rect.from([node.position.x, node.position.y, node.width ?? 1, node.height ?? 1])
  })
  nodesSource.nodeCreator.createLabelsSource({
    data: node => [node.data.label]
  })
  nodesSource.nodeCreator.defaults.labels.layoutParameter = FreeNodeLabelModel.CENTER

  const edgesSource = builder.createEdgesSource({
    data: edges,
    sourceId: edge => edge.source,
    targetId: edge => edge.target
  })
  const edgeCreator = edgesSource.edgeCreator
  edgeCreator.bendsProvider = edge =>
    edge.data?.yData?.bends?.map((bend: { x: number; y: number }) => Point.from(bend))
  const labelsSource = edgeCreator.createLabelsSource({
    data: edge => {
      let labels = []
      if (edge.label) {
        labels.push(edge.label)
      }
      if (edge.data?.labels) {
        labels = labels.concat(edge.data.labels)
      }
      return labels
    }
  })
  labelsSource.labelCreator.tagProvider = dataItem => dataItem

  edgeCreator.defaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createParameter()

  const graph = builder.buildGraph()

  const rootElement = getRootNode(reactFlowRef)

  graph.nodes.forEach(node => {
    node.labels.forEach((label, index) => {
      const preferredSize = measureLabel(`node-label-${node.tag.id}-${index}`, zoom, rootElement)
      if (preferredSize.width > 0 && preferredSize.height > 0) {
        graph.setLabelPreferredSize(label, preferredSize)
      }

      if (node.tag.data?.yData) {
        const yData = node.tag.data?.yData
        const labelBoxes = yData?.labelBoxes
        if (labelBoxes && labelBoxes.length > 0) {
          const labelBox = yData.labelBoxes[0]
          if (labelBox) {
            const labelRectangle = new OrientedRectangle(
              labelBox.x + node.layout.center.x - labelBox.width * 0.5,
              labelBox.y + node.layout.center.y + labelBox.height * 0.5,
              labelBox.width,
              labelBox.height
            )
            const center = labelRectangle.center
            labelRectangle.angle = labelBox.angle
            labelRectangle.center = center

            graph.setLabelLayoutParameter(
              label,
              FreeNodeLabelModel.INSTANCE.findBestParameter(label, labelRectangle)
            )
          }
        }
      }
    })
  })

  graph.edges.forEach(edge => {
    edge.labels.forEach((label, index) => {
      const preferredSize = measureLabel(`edge-label-${edge.tag.id}-${index}`, zoom, rootElement)
      if (preferredSize.width > 0 && preferredSize.height > 0) {
        graph.setLabelPreferredSize(label, preferredSize)
      }
      label.tag = {
        ownerId: edge.tag.id,
        labelIndex: index,
        data: label.tag
      }

      if (edge.tag.data?.yData) {
        const yData = edge.tag.data?.yData
        const labelBoxes = yData?.labelBoxes
        if (labelBoxes && labelBoxes.length > 0) {
          const labelBox = yData.labelBoxes[index]
          if (labelBox) {
            const labelRectangle = new OrientedRectangle(
              labelBox.x,
              labelBox.y,
              preferredSize.width,
              preferredSize.height
            )
            labelRectangle.angle = labelBox.angle

            graph.setLabelLayoutParameter(
              label,
              FreeEdgeLabelModel.INSTANCE.findBestParameter(label, labelRectangle)
            )
          }
        }
      }
    })
    if (edge.tag.data?.yData?.sourcePoint && edge.tag.data?.yData?.targetPoint) {
      const sourceNode = edge.sourceNode!
      const targetNode = edge.targetNode!
      graph.setEdgePorts(
        edge,
        graph.addPortAt(sourceNode, {
          x: sourceNode.layout.x + edge.tag.data?.yData?.sourcePoint.x,
          y: sourceNode.layout.y + edge.tag.data?.yData?.sourcePoint.y
        }),
        graph.addPortAt(targetNode, {
          x: targetNode.layout.x + edge.tag.data?.yData?.targetPoint.x,
          y: targetNode.layout.y + edge.tag.data?.yData?.targetPoint.y
        })
      )
    }
  })

  return graph
}

function transferLayout(
  graph: IGraph,
  reactFlowRef?: RefObject<HTMLElement>
): { arrangedNodes: Node[]; arrangedEdges: Edge[] } {
  if (!checkLicense()) {
    return { arrangedNodes: [], arrangedEdges: [] }
  }

  const nodeOffsets = new Map()

  const hierarchicNodes = new GroupingSupport(graph).getDescendantsBottomUp(null)
  hierarchicNodes.forEach(node => {
    const parent = graph.getParent(node)

    if (parent) {
      nodeOffsets.set(node, {
        dx: -parent.layout.x,
        dy: -parent.layout.y
      })
    }
  })

  const rootElement = getRootNode(reactFlowRef)

  const arrangedNodes = graph.nodes
    .map(node => {
      const offset = nodeOffsets.get(node) ?? { dx: 0, dy: 0 }
      return {
        ...node.tag,
        position: { x: node.layout.x + offset.dx, y: node.layout.y + offset.dy },
        style: { ...node.tag.style, width: node.layout.width, height: node.layout.height },
        data: {
          ...node.tag.data,
          yData: {
            sourceHandles: graph
              .outEdgesAt(node)
              .map(edge => ({
                id: getSourceHandleId(edge),
                location: {
                  x: edge.sourcePort!.location.x - edge.sourceNode!.layout.x,
                  y: edge.sourcePort!.location.y - edge.sourceNode!.layout.y
                },
                position: getHandlePosition(edge, true)
              }))
              .toArray(),
            targetHandles: graph
              .inEdgesAt(node)
              .map(edge => ({
                id: getTargetHandleId(edge),
                location: {
                  x: edge.targetPort!.location.x - edge.targetNode!.layout.x,
                  y: edge.targetPort!.location.y - edge.targetNode!.layout.y
                },
                position: getHandlePosition(edge, false)
              }))
              .toArray(),
            labelBoxes: node.labels
              .map((label, index) => {
                const rect = label.layout as OrientedRectangle
                const labelId = `node-label-${node.tag.id}-${index}`
                const padding = calculatePadding(labelId, rootElement)
                const angle = rect.angle
                return {
                  id: labelId,
                  x: rect.center.x - node.layout.center.x,
                  y: rect.center.y - node.layout.center.y,
                  width: rect.width - padding.right - padding.left,
                  height: rect.height - padding.top - padding.bottom,
                  angle: angle,
                  transform: `rotate(${angle}rad)`
                }
              })
              .toArray()
          }
        }
      }
    })
    .toArray()

  const arrangedEdges = graph.edges
    .map(edge => {
      return {
        ...edge.tag,
        sourceHandle: getSourceHandleId(edge),
        targetHandle: getTargetHandleId(edge),
        data: {
          ...edge.tag.data,
          yData: {
            bends: edge.bends.map(bend => ({ x: bend.location.x, y: bend.location.y })).toArray(),
            sourcePoint: {
              x: edge.sourcePort!.location.x - edge.sourceNode!.layout.x,
              y: edge.sourcePort!.location.y - edge.sourceNode!.layout.y
            },
            targetPoint: {
              x: edge.targetPort!.location.x - edge.targetNode!.layout.x,
              y: edge.targetPort!.location.y - edge.targetNode!.layout.y
            },
            labelBoxes: edge.labels
              .map((label, index) => {
                const rect = label.layout as OrientedRectangle
                const labelId = `edge-label-${edge.tag.id}-${index}`
                const padding = calculatePadding(labelId, rootElement)
                return {
                  id: labelId,
                  x: rect.anchorX,
                  y: rect.anchorY,
                  width: rect.width - padding.left - padding.right,
                  height: rect.height - padding.top - padding.bottom,
                  angle: rect.angle,
                  transform: getTransformMatrix(rect).toCssTransform()
                }
              })
              .toArray()
          }
        }
      }
    })
    .toArray()
  return { arrangedNodes, arrangedEdges }
}

function getSourceHandleId(edge: IEdge) {
  return `${edge.tag.id}-source`
}

function getTargetHandleId(edge: IEdge) {
  return `${edge.tag.id}-target`
}

function getHandlePosition(edge: IEdge, isSourceHandle: boolean): Position {
  const sourcePortLocation = edge.sourcePort!.location.toPoint()
  const targetPortLocation = edge.targetPort!.location.toPoint()

  const port = (isSourceHandle ? sourcePortLocation : targetPortLocation).toPoint()
  const nodeRect = (isSourceHandle ? edge.sourceNode!.layout : edge.targetNode!.layout).toRect()

  let side = getSide(nodeRect, port)
  // if the port lies in the center of the node, we have to check the side from which the edge leaves/enters the node
  if (side === 'center') {
    // if at source-handle: the edge segment to test is between the sourcePort and the first bend if one exists,
    // or the targetPort for straight-line edges
    // if at target-handle: the edge segment to test is between the target and the last bend if one exists,
    // or the sourcePort for straight-line edges
    const oppositePort = isSourceHandle ? targetPortLocation : sourcePortLocation
    const firstEdgePoint =
      edge.bends.size > 0
        ? (isSourceHandle ? edge.bends.at(0)!.location : edge.bends.at(-1)!.location).toPoint()
        : oppositePort
    const intersectionPoint = nodeRect.findLineIntersection(port, firstEdgePoint)
    if (intersectionPoint) {
      // find on which side of the node lies the intersection point
      side = getSide(nodeRect, intersectionPoint.toPoint())
    }
  }
  return translateSide(side)
}

function getSide(
  rect: Rect,
  point: Point
): 'left' | 'right' | 'top' | 'bottom' | 'center' | 'other' {
  const EPSILON = 0.001
  if (Math.abs(point.x - rect.topLeft.x) < EPSILON) {
    return 'left'
  } else if (Math.abs(point.x - rect.bottomRight.x) < EPSILON) {
    return 'right'
  }
  if (Math.abs(point.y - rect.topLeft.y) < EPSILON) {
    return 'top'
  } else if (Math.abs(point.y - rect.bottomLeft.y) < EPSILON) {
    return 'bottom'
  }
  // center has to be considered independently
  if (Math.abs(point.x - rect.center.x) < EPSILON || Math.abs(point.y - rect.center.y) < EPSILON) {
    return 'center'
  }
  return 'other'
}

/**
 * Translates the side to a handle position.
 */
function translateSide(side: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'other') {
  // handle position should be the opposite of the side to make sure that the edge passes through the handle
  // and does not leave empty space between the edge's endpoints and the node when the handle is hidden
  switch (side) {
    case 'left':
      return Position.Right
    case 'right':
      return Position.Left
    case 'top':
      return Position.Bottom
    case 'bottom':
      return Position.Top
    case 'other':
    default:
      return Position.Top
  }
}

function measureLabel(
  labelId: string,
  zoom: number,
  rootElement: Element | Document | DocumentFragment
): Size {
  const labelElement = rootElement.querySelector(`[data-id="${labelId}"]`) as HTMLDivElement
  if (labelElement) {
    const oldTransform = labelElement.style.transform
    labelElement.style.transform = ''
    const oldBoxSizing = labelElement.style.boxSizing
    labelElement.style.boxSizing = 'content-box'
    const computedStyle = window.getComputedStyle(labelElement)
    // label padding should also be included in the width/size during the layout
    const labelPadding = calculatePadding(labelId, rootElement)
    let width = parseFloat(computedStyle.width)
    let height = parseFloat(computedStyle.height)
    if (width <= 0 || height <= 0) {
      const clientRect = labelElement.getBoundingClientRect()
      width = width > 0 ? width : clientRect.width / zoom
      height = height > 0 ? height : clientRect.height / zoom
    }
    labelElement.style.transform = oldTransform
    labelElement.style.boxSizing = oldBoxSizing
    return new Size(
      width + labelPadding.left + labelPadding.right,
      height + labelPadding.top + labelPadding.bottom
    )
  }
  return Size.ZERO
}

function calculatePadding(labelId: string, rootElement: Element | Document | DocumentFragment) {
  const element = rootElement.querySelector(`[data-id="${labelId}"]`) as HTMLDivElement
  if (element) {
    const elementStyle = window.getComputedStyle(element)
    return {
      top: parseFloat(elementStyle.paddingTop) ?? 0,
      right: parseFloat(elementStyle.paddingRight) ?? 0,
      bottom: parseFloat(elementStyle.paddingBottom) ?? 0,
      left: parseFloat(elementStyle.paddingLeft) ?? 0
    }
  }
  return { top: 0, bottom: 0, left: 0, right: 0 }
}

function getTransformMatrix(layout: OrientedRectangle): Matrix {
  const projectedBaseline = new Point(-layout.upY, layout.upX)

  const width = layout.width
  const height = layout.height
  const anchorX = layout.anchorX
  const anchorY = layout.anchorY
  const upY = layout.upY
  const upX = layout.upX

  if (layout.upY == -1) {
    return new Matrix(1, 0, 0, 1, anchorX, anchorY - height)
  }
  if (projectedBaseline.x < 0) {
    return new Matrix(upY, upX, -upX, upY, anchorX - upY * width, anchorY + upX * width)
  }
  return new Matrix(-upY, -upX, upX, -upY, anchorX + upX * height, anchorY + upY * height)
}

function getConfiguration<TNodeData, TEdgeData>(
  configuration: LayoutConfiguration<LayoutName, TNodeData, TEdgeData> | LayoutName
): {
  name: LayoutName
  layoutOptions?: LayoutAlgorithmOptions
  layoutData?: LayoutDataProvider<TNodeData, TEdgeData>
} {
  if (typeof configuration === 'string') {
    return { name: configuration }
  }
  return {
    name: configuration.name,
    layoutOptions: configuration.layoutOptions,
    layoutData: configuration.layoutData ?? {}
  }
}
