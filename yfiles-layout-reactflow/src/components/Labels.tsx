import { Node, NodeProps } from '@xyflow/react'
import LabelText from './LabelText.tsx'
import { CSSProperties, ReactNode } from 'react'
import { NodeData } from '../layout/layout-types.ts'

/**
 * A label with a text and styling properties.
 */
export interface Label {
  /** The text of the label. */
  label: string
  /** An optional CSS style used for the label. */
  labelStyle?: CSSProperties
  /** An optional CSS class used for styling the label. */
  className?: string
}

/**
 * The layout information of a label.
 */
export interface LabelBox {
  /** The label id. */
  id: string
  /** The x-coordinate of the label. */
  x: number
  /** The y-coordinate of the label. */
  y: number
  /** The width of the label. */
  width: number
  /** The height of the label. */
  height: number
  /**
   * The rotation angle of the label in degrees.
   * Used for checking whether the text has to be flipped and for retrieving the angle information from previous layouts.
   */
  angle: number
  /**
   * The CSS transform to be applied on the label element based on the result of the layout algorithm.
   * By default, for edges the transform-origin is set to '0px 0px'.
   */
  transform: string
}

/**
 * The properties that describe the labels of an edge with their layout and styling.
 */
export interface EdgeLabelsProps {
  /**
   * The list of labels for the given edge.
   */
  labels: (Label | string | ReactNode)[]
  /**
   * The id of the edge to which the labels belong.
   */
  ownerId: string
  /**
   * The layout information for the labels.
   */
  labelBoxes: LabelBox[]
  /**
   * An optional CSS style used for the label.
   */
  labelStyle?: CSSProperties
  /**
   * An optional CSS class used for styling the label.
   */
  className?: string
}

/**
 * A component that renders a node label with text that is placed at coordinates that resulted from a yFiles layout algorithm.
 * Node labels can appear outside the node and be rotated.
 * The text must be specified in `data.label` and the label box is retrieved from data.yData.labelBoxes.
 *
 * ```tsx
 * export function CustomNode(props: NodeProps) {
 *   return (
 *     <>
 *       <NodeLabel {...props}></NodeLabel>
 *     </>
 *   )
 * }
 * ```
 */
export function NodeLabel({ data, id }: NodeProps<Node<NodeData>>) {
  if (!data?.label) {
    return
  }
  const dataId = `node-label-${id}-0`
  const labelBox = data?.yData?.labelBoxes?.find((layout: LabelBox) => layout.id === dataId)

  const nodeLabelProps = getTextProps(data?.label, labelBox, data?.labelStyle, data?.className)

  return <LabelText {...nodeLabelProps} dataId={dataId} isNodeLabel={true}></LabelText>
}

/**
 * A component that renders edge labels with text that are placed at coordinates that resulted from a yFiles layout
 * algorithm. At a single edge, there can be multiple edge labels which may be rotated.
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
 *   return (
 *     <>
 *       <BaseEdge path={edgePath} {...props} />
 *       <EdgeLabelRenderer>
 *         <EdgeLabels
 *           labels={labels}
 *           ownerId={props.id}
 *           labelBoxes={props.data?.yData?.labelBoxes ?? []}
 *         ></EdgeLabels>
 *       </EdgeLabelRenderer>
 *     </>
 *   )
 * }
 * ```
 */
export function EdgeLabels({ labels, ownerId, labelBoxes, labelStyle }: EdgeLabelsProps) {
  return (
    <div style={{ position: 'relative' }}>
      {labels.map((label: Label | string | ReactNode, index: number) => {
        if (!label) {
          return
        }

        const dataId = `edge-label-${ownerId}-${index}`
        const labelBox = labelBoxes.find((labelBox: LabelBox) => labelBox.id === dataId)

        const edgeTextProps = getTextProps(label, labelBox, labelStyle)

        return (
          <LabelText
            {...edgeTextProps}
            dataId={dataId}
            key={`${dataId}-text-${index}`}
            isNodeLabel={false}
          ></LabelText>
        )
      })}
    </div>
  )
}

function getTextProps(
  label: Label | string | ReactNode,
  labelBox?: LabelBox,
  labelStyle?: CSSProperties,
  className?: string
) {
  if (isLabelType(label)) {
    return {
      x: labelBox?.x ?? 0,
      y: labelBox?.y ?? 0,
      width: labelBox?.width,
      height: labelBox?.height,
      angle: labelBox?.angle ?? 0,
      transform: labelBox?.transform,
      label: label.label,
      labelStyle: label.labelStyle ?? labelStyle,
      className: label?.className ?? className
    }
  }
  return {
    x: labelBox?.x ?? 0,
    y: labelBox?.y ?? 0,
    width: labelBox?.width,
    height: labelBox?.height,
    angle: labelBox?.angle ?? 0,
    transform: labelBox?.transform,
    label,
    labelStyle,
    className
  }
}

export function isLabelType(label: Label | string | ReactNode): label is Label {
  return (label as Label).label !== undefined
}
