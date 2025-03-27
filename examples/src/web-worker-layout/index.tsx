import { useCallback } from 'react'
import { ReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import SimpleData from '../data/SimpleData'
import {
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'

const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
  type: 'module'
})

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

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const { runLayout, running } = useLayout<NodeProps<{ label: string }>>({ layoutWorker })

  // run initial layout
  useNodesMeasuredEffect(async () => {
    runLayout({
      name: 'HierarchicalLayout',
      layoutOptions: { minimumLayerDistance: 60 },
      layoutData: { ports: { sourcePortCandidates: () => ['right'] } }
    })
  })

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
        <button
          onClick={() =>
            runLayout({
              name: 'HierarchicalLayout',
              layoutOptions: { minimumLayerDistance: 60 },
              layoutData: { ports: { sourcePortCandidates: () => ['right'] } }
            })
          }
          disabled={running}
        >
          Layout
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
