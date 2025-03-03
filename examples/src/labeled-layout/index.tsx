import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  EdgeProps,
  Node,
  NodeProps,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  EdgeLabelPreferredPlacement,
  LabelData,
  MultiHandleNode,
  PolylineEdge,
  useLayout,
  useNodesMeasuredEffect
} from '@yworks/yfiles-layout-reactflow'
import LabeledData from '../data/LabeledData.ts'

const initialNodes: Node[] = LabeledData.nodes
const initialEdges: Edge[] = LabeledData.edges

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

  const labelPreferredPlacement = useMemo(
    () =>
      (label: LabelData): EdgeLabelPreferredPlacement => {
        if (label.labelIndex === 1) {
          return {
            edgeSide: 'left-of-edge',
            distanceToEdge: 0,
            placementAlongEdge: 'at-source',
            angleReference: 'relative-to-edge-flow'
          }
        } else if (label.labelIndex === 2) {
          return {
            edgeSide: 'right-of-edge',
            distanceToEdge: 0,
            placementAlongEdge: 'at-target'
          }
        } else {
          return {
            edgeSide: 'on-edge',
            placementAlongEdge: 'at-center'
          }
        }
      },
    []
  )

  const { runLayout, running } = useLayout<
    NodeProps<{ label: string | ReactNode }>,
    EdgeProps<{ labels: (string | ReactNode)[] }>
  >()

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({
      name: 'HierarchicalLayout',
      layoutOptions: {
        edgeLabelPlacement: 'integrated',
        nodeLabelPlacement: 'consider',
      },
      layoutData: {
        edgeLabelPreferredPlacements: labelPreferredPlacement
      }
    })
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
        <button
          onClick={() =>
            runLayout({
              name: 'GenericLabeling',
              layoutOptions: { scope: 'node-labels' },
              layoutData: {
                edgeLabelPreferredPlacements: labelPreferredPlacement
              }
            })
          }
          disabled={layoutRunning}
        >
          Generic Labeling
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'HierarchicalLayout',
              layoutOptions: {
                edgeLabelPlacement: 'integrated',
                nodeLabelPlacement: 'consider',
              },
              layoutData: {
                edgeLabelPreferredPlacements: labelPreferredPlacement
              }
            })
          }
          disabled={layoutRunning}
        >
          Hierarchical Layout
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'RadialTreeLayout',
              layoutOptions: {
                edgeLabelPlacement: 'integrated',
                nodeLabelPlacement: 'ray-like-leaves'
              },
              layoutData: {
                edgeLabelPreferredPlacements: labelPreferredPlacement
              }
            })
          }
          disabled={layoutRunning}
        >
          Radial Tree Layout
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
