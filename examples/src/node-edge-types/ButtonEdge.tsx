import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps /*, getBezierPath*/, useReactFlow } from '@xyflow/react'
import './buttonedge.css'
import { getPolylinePath } from '@yworks/yfiles-layout-reactflow'

// ButtonEdge from https://reactflow.dev/examples/edges/custom-edges sample as polyline edge

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  // sourcePosition,
  // targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps<Edge<{yData:{bends: { x: number; y: number }[]}}>>) {
  const { setEdges } = useReactFlow()

  // const [edgePath, labelX, labelY] = getBezierPath({
  //     sourceX,
  //     sourceY,
  //     sourcePosition,
  //     targetX,
  //     targetY,
  //     targetPosition,
  // });

  const [edgePath, labelX, labelY] = getPolylinePath({
    sourceX: sourceX,
    sourceY: sourceY,
    targetX: targetX,
    targetY: targetY,
    bends: data?.yData?.bends ?? []
  })

  const onEdgeClick = () => {
    setEdges(edges => edges.filter(edge => edge.id !== id))
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
