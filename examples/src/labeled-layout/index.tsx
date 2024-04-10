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
  PreferredPlacementDescriptor,
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
      (label: LabelData): PreferredPlacementDescriptor => {
        if (label.labelIndex === 1) {
          return {
            sideOfEdge: 'left-of-edge',
            distanceToEdge: 0,
            placeAlongEdge: 'at-source',
            angleReference: 'relative-to-edge-flow'
          }
        } else if (label.labelIndex === 2) {
          return {
            sideOfEdge: 'right-of-edge',
            distanceToEdge: 0,
            placeAlongEdge: 'at-target'
          }
        } else {
          return {
            sideOfEdge: 'on-edge',
            placeAlongEdge: 'at-center'
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
      name: 'HierarchicLayout',
      layoutOptions: {
        integratedEdgeLabeling: true,
        considerNodeLabels: true,
        orthogonalRouting: true
      },
      layoutData: {
        edgeLabelPreferredPlacement: labelPreferredPlacement
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
              layoutOptions: { placeEdgeLabels: true, placeNodeLabels: true },
              layoutData: {
                edgeLabelPreferredPlacement: labelPreferredPlacement
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
              name: 'HierarchicLayout',
              layoutOptions: {
                integratedEdgeLabeling: true,
                considerNodeLabels: true,
                orthogonalRouting: true
              },
              layoutData: {
                edgeLabelPreferredPlacement: labelPreferredPlacement
              }
            })
          }
          disabled={layoutRunning}
        >
          Hierarchic Layout
        </button>
        <button
          onClick={() =>
            runLayout({
              name: 'BalloonLayout',
              layoutOptions: {
                integratedEdgeLabeling: true,
                integratedNodeLabeling: true,
                nodeLabelingPolicy: 'ray-like-leaves'
              },
              layoutData: {
                edgeLabelPreferredPlacement: labelPreferredPlacement
              }
            })
          }
          disabled={layoutRunning}
        >
          Balloon Layout
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
