import { useCallback, useEffect, useState } from 'react'
import {
  addEdge,
  Connection,
  Edge,
  EdgeProps,
  Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'
import SimpleData from '../data/SimpleData'

const initialNodes: Node[] = SimpleData.nodes
const initialEdges: Edge[] = SimpleData.edges

const edgeTypes = {
  default: PolylineEdge
}

const nodeTypes = {
  default: MultiHandleNode
}

const LayoutFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [layoutRunning, setLayoutRunning] = useState(false)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const { runLayout, running } = useLayout()

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout('OrthogonalLayout')
  })

  useEffect(() => {
    setLayoutRunning(running)
  }, [running])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      <Panel position="top-right">
        <button onClick={() => runLayout('OrthogonalLayout')} disabled={layoutRunning}>
          Orthogonal
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'OrganicLayout',
              layoutOptions: { deterministic: true, defaultMinimumNodeDistance: 100 }
            })
          }
          disabled={layoutRunning}
        >
          Organic
        </button>
        <button onClick={() => runLayout('CircularLayout')} disabled={layoutRunning}>
          Circular
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'HierarchicalLayout',
              layoutOptions: { minimumLayerDistance: 60 },
              layoutData: {
                ports: {
                  sourcePortCandidates: (edge: EdgeProps) =>
                    parseInt(edge.target) % 2 === 0 ? ['right'] : ['left']
                }
              }
            })
          }
          disabled={layoutRunning}
        >
          Hierarchic
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'TreeLayout',
              layoutOptions: { layoutOrientation: 'left-to-right' },
              layoutData: {
                childOrder: {
                  outEdgeComparators: () => (edge1: EdgeProps, edge2: EdgeProps) =>
                    parseInt(edge1.target) - parseInt(edge2.target)
                }
              }
            })
          }
          disabled={layoutRunning}
        >
          Tree
        </button>
      </Panel>
    </ReactFlow>
  )
}

export default function Flow() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  )
}
