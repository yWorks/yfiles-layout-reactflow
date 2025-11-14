import { useCallback } from 'react'
import {
  addEdge,
  Connection,
  Edge,
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
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'
import SimpleData from '../data/SimpleData'
import { useCustomLayout } from './useCustomLayout.tsx'

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
  const runLayout = useCustomLayout()

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout()
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
        <button onClick={runLayout}>Layout</button>
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
