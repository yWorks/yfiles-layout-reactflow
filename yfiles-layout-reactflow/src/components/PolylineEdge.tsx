import { BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react'
import { GeneralPath } from '@yfiles/yfiles'
import { ReactNode } from 'react'
import { EdgeLabels, Label } from './Labels.tsx'
import { EdgeData, EdgeLayoutData } from '../layout/layout-types.ts'

/**
 * An edge component that supports bends and the result of a yFiles layout
 * algorithm.
 *
 * The information about the edge path after running a layout algorithm will be given by the `data.yData`
 * of each edge, see {@link EdgeLayoutData}.
 *
 * ```tsx
 * const edgeTypes = {
 *   polyline: PolylineEdge
 * }
 *
 * const LayoutFlow = () => {
 *   const [nodes] = useNodesState(initialNodes)
 *   const [edges] = useEdgesState(initialEdges)
 *
 *   return (
 *     <ReactFlow
 *       nodes={nodes}
 *       edges={edges}
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
 * @param props - The properties of a React Flow edge
 */
export function PolylineEdge(props: EdgeProps) {
  const edgeData = props?.data as EdgeData
  const [edgePath] = getPolylinePath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    bends: edgeData?.yData?.bends ?? []
  })

  let labels: (Label | string | ReactNode)[] = []
  if (props.label) {
    labels.push(props.label as string)
  }
  if ((props.data?.labels as string[])?.length ?? 0 > 0) {
    labels = labels.concat(edgeData?.labels)
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={props.id}
        style={props.style}
        interactionWidth={props.interactionWidth}
        markerStart={props.markerStart}
        markerEnd={props.markerEnd}
        label={props.label}
        labelStyle={props.labelStyle}
        labelShowBg={props.labelShowBg}
        labelBgPadding={props.labelBgPadding}
        labelBgStyle={props.labelBgStyle}
        labelBgBorderRadius={props.labelBgBorderRadius}
      />
      <EdgeLabelRenderer>
        <EdgeLabels
          labels={labels}
          ownerId={props.id}
          labelBoxes={edgeData?.yData?.labelBoxes ?? []}
          labelStyle={props.labelStyle}
          key={`${props.id}-edgeLabels`}
        ></EdgeLabels>
      </EdgeLabelRenderer>
    </>
  )
}

/**
 * Parameters that describe a polyline edge path.
 */
export interface PolylinePathProps {
  /**
   * The x-coordinate of the source point of the edge.
   */
  sourceX: number
  /**
   * The y-coordinate of the source point of the edge.
   */
  sourceY: number
  /**
   * The x-coordinate of the target point of the edge.
   */
  targetX: number
  /**
   * The y-coordinate of the target point of the edge.
   */
  targetY: number
  /**
   * The coordinates of the bends.
   */
  bends: { x: number; y: number }[]
}

/**
 * The function `getPolylinePath` returns everything you need to render a polyline edge between two nodes.
 *
 * ```tsx
 * export function CustomEdge(props: EdgeProps) {
 *   const [edgePath] = getPolylinePath({
 *     sourceX: props.sourceX,
 *     sourceY: props.sourceY,
 *     targetX: props.targetX,
 *     targetY: props.targetY,
 *     bends: props.data?.yData?.bends ?? []
 *   })
 *
 *   return ( <BaseEdge path={edgePath} {...props} /> )
 * }
 * ```
 *
 * @param params - The coordinates of the source point, the target point, and the bends.
 * @returns an array that contains the edge path, the center location of the edge, e.g. to place a label, and the
 * relative center location of the edge.
 */
export function getPolylinePath(
  params: PolylinePathProps
): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
  const { sourceX, sourceY, targetX, targetY, bends } = params

  const generalPath = new GeneralPath()
  generalPath.moveTo(sourceX, sourceY)
  bends.forEach((bend: { x: number; y: number }) => {
    generalPath.lineTo(bend.x, bend.y)
  })
  generalPath.lineTo(targetX, targetY)

  let centerX: number
  let centerY: number
  if (bends.length === 0) {
    centerX = (sourceX + targetX) * 0.5
    centerY = (sourceY + targetY) * 0.5
  } else if (bends.length === 1) {
    centerX = (sourceX + bends[0].x) * 0.5
    centerY = (sourceY + bends[0].y) * 0.5
  } else {
    const bend0 = bends[Math.floor((bends.length - 1) / 2)]
    const bend1 = bends[Math.floor((bends.length - 1) / 2) + 1]
    centerX = (bend0.x + bend1.x) * 0.5
    centerY = (bend0.x + bend1.y) * 0.5
  }

  return [
    generalPath.createSvgPathData(),
    centerX,
    centerY,
    Math.abs(centerX - sourceX),
    Math.abs(centerY - sourceY)
  ]
}
