import { FormEvent, useCallback, useState } from 'react'
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
  HierarchicalLayoutOptions,
  LayoutAlgorithmOptions,
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'
import SimpleData from '../data/SimpleData.ts'

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
  const [layoutOptions, setLayoutOptions] = useState<LayoutAlgorithmOptions>({})

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const { runLayout, running } = useLayout()

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({
      name: 'HierarchicalLayout',
      layoutOptions: layoutOptions as HierarchicalLayoutOptions
    })
  })

  const updateLayoutConfiguration = useCallback(
    (option: object) => {
      setLayoutOptions({ ...layoutOptions, ...option })
    },
    [layoutOptions, setLayoutOptions]
  )

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
      <Panel
        position="top-right"
        style={{ backgroundColor: '#cdcdcd', padding: 15, borderRadius: 5 }}
      >
        <div>
          <div>
            <label htmlFor="automatic-edge-grouping">Automatic Edge Grouping</label>
            <input
              type="checkbox"
              id="automatic-edge-grouping"
              onInput={(event: FormEvent<HTMLInputElement>) =>
                updateLayoutConfiguration({ automaticEdgeGrouping: event.currentTarget.checked })
              }
            />
          </div>
          <div>
            <label htmlFor="layer-distance">Layer Distance</label>
            <input
              type="range"
              id="layer-distance"
              min="15"
              max="200"
              onInput={(event: FormEvent<HTMLInputElement>) =>
                updateLayoutConfiguration({
                  minimumLayerDistance: parseFloat(event.currentTarget.value)
                })
              }
            />
          </div>
        </div>
        <button
          onClick={() =>
            runLayout({
              name: 'HierarchicalLayout',
              layoutOptions: layoutOptions as HierarchicalLayoutOptions
            })
          }
          disabled={running}
          style={{ marginTop: 20 }}
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
