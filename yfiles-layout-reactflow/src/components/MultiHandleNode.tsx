import { Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow'
import { ComponentType, MutableRefObject, useEffect, useRef } from 'react'
import { NodeLabel } from './Labels.tsx'

/**
 * A node component with multiple handles and a label that supports the results of a yFiles layout
 * algorithm.
 *
 * The information about the position of each handle will be given by the `data.yData` of each node,
 * if any exists (see {@link NodeLayoutData}). Otherwise, handles will be placed on the top and on the bottom side of each node.
 *
 * ```tsx
 * const nodeTypes = {
 *   handles: MultiHandleNode
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
 *       nodeTypes={nodeTypes}
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
 * @param props - The properties of a React Flow node.
 */
export function MultiHandleNode(props: NodeProps) {
  return (
    <>
      <NodeLabel {...props}></NodeLabel>
      <MultiHandles {...props}></MultiHandles>
    </>
  )
}

/**
 * A higher order component (hoc) that adds multiple handles to a node component, thus enabling this
 * component for yFiles layout.
 *
 * ```tsx
 * const CustomNode = () => (
 *   <div>Custom Node</div>
 * )
 *
 * const nodeTypes = {
 *   custom: withMultiHandles(CustomNode)
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
 *       nodeTypes={nodeTypes}
 *     ></ReactFlow>
 *   )
 * }
 * ```
 */
export function withMultiHandles(Component: ComponentType<NodeProps>) {
  return (props: NodeProps) => {
    return (
      <>
        <Component {...props}></Component>
        <MultiHandles {...props}></MultiHandles>
      </>
    )
  }
}

function MultiHandles(props: NodeProps) {
  const { data, id } = props
  const updateNodeInternals = useUpdateNodeInternals()

  const sourceHandlesRef = useRef(null)
  const targetHandlesRef = useRef(null)

  useEffect(() => {
    updateNodeInternals(id)
  }, [data, id, updateNodeInternals])

  useEffect(() => {
    // The handles' div should align precisely with the parent container, including its borders
    const { leftBorder, topBorder } = getParentBorders(sourceHandlesRef)
    setHandlesPosition(sourceHandlesRef, leftBorder, topBorder)
    setHandlesPosition(targetHandlesRef, leftBorder, topBorder)
  }, [data, id])

  return (
    <>
      <div ref={sourceHandlesRef} className="handles" style={{ position: 'absolute' }}>
        <Handle
          type="source"
          position={Position.Top}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0
          }}
        />{' '}
        {data?.yData?.sourceHandles?.map(
          (handle: { id: string; location: { x: number; y: number }; position: Position }) => (
            <Handle
              key={handle.id}
              id={handle.id}
              type="source"
              position={handle.position}
              style={{
                left: handle.location.x,
                top: handle.location.y,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )
        )}
      </div>
      <div ref={targetHandlesRef} className="handles" style={{ position: 'absolute' }}>
        <Handle
          type="target"
          position={Position.Top}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0
          }}
        />
        {data?.yData?.targetHandles?.map(
          (handle: { id: string; location: { x: number; y: number }; position: Position }) => (
            <Handle
              key={handle.id}
              id={handle.id}
              type="target"
              position={handle.position}
              style={{
                left: handle.location.x,
                top: handle.location.y,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )
        )}
      </div>
    </>
  )
}

function getParentBorders(handlesRef: MutableRefObject<null>) {
  let leftBorderWidth = 1
  let topBorderWidth = 1
  if (handlesRef.current) {
    const parent = (handlesRef.current! as HTMLDivElement).parentElement
    if (parent) {
      const computedStyle = getComputedStyle(parent)
      leftBorderWidth = parseInt(computedStyle.getPropertyValue('border-left-width'))
      topBorderWidth = parseInt(computedStyle.getPropertyValue('border-top-width'))
    }
  }
  return { leftBorder: leftBorderWidth, topBorder: topBorderWidth }
}

function setHandlesPosition(
  handlesRef: MutableRefObject<null> | null,
  leftBorder: number,
  topBorder: number
) {
  if (handlesRef && handlesRef.current) {
    const handlesDiv = handlesRef.current as HTMLDivElement
    handlesDiv.style.left = `-${leftBorder}px`
    handlesDiv.style.top = `-${topBorder}px`
  }
}
