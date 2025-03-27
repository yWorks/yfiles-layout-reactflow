import { useCallback } from 'react'
import { ReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect,
  withMultiHandles
} from '@yworks/yfiles-layout-reactflow'
import StarData from '../data/StarData'
import CustomEdge from './ButtonEdge'

const initialNodes: Node[] = StarData.nodes
const initialEdges: Edge[] = StarData.edges

const CustomNode = () => (
  <div
    style={{
      border: '3px solid cornflowerblue',
      backgroundColor: 'navy',
      color: 'white',
      padding: '20px'
    }}
  >
    Custom Node
  </div>
)

const edgeTypes = {
  default: PolylineEdge,
  custom: CustomEdge
}

const nodeTypes = {
  default: MultiHandleNode,
  custom: withMultiHandles(CustomNode)
}

const LayoutFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const { runLayout, running } = useLayout()

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout('OrthogonalLayout')
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
        <button onClick={() => runLayout('OrthogonalLayout')} disabled={running}>
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
