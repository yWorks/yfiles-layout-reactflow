import { useCallback } from 'react'
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'
import HierarchicData from '../data/HierarchicData'

const initialNodes: Node[] = HierarchicData.nodes
const initialEdges: Edge[] = HierarchicData.edges

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

  const { runLayout } = useLayout<NodeProps<{ label: string }>>()

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({ name: 'HierarchicalLayout', layoutData: { groupNodePadding: () => 40 } })
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
        <button onClick={() => runLayout('HierarchicalLayout')}>Layout</button>
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
