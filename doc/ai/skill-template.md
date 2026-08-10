---
name: yfiles-layout-reactflow

description: Use when integrating yFiles layout algorithms into React Flow applications. This includes adding yFiles layouts, configuring useLayout, and implementing specialized node/edge types (MultiHandleNode, PolylineEdge).
---

# yFiles Layout for React Flow

Integrate `@yworks/yfiles-layout-reactflow` to add automatic layouts to React Flow. Mandatory: register the yFiles license and use specialized node/edge types for polyline and bend support.

## Project Setup

### Node and Edge Types

Use `MultiHandleNode` and `PolylineEdge` to visualize layout results (bends, handles).

```tsx
import { MultiHandleNode, PolylineEdge } from '@yworks/yfiles-layout-reactflow'

const nodeTypes = { default: MultiHandleNode }
const edgeTypes = { default: PolylineEdge }
```

For custom styles, wrap with `withMultiHandles` or use `getPolylinePath`.

```tsx
import { withMultiHandles, getPolylinePath } from '@yworks/yfiles-layout-reactflow'
import { BaseEdge, EdgeProps } from '@xyflow/react'

const nodeTypes = { custom: withMultiHandles(CustomNode) }

export function CustomEdge(props: EdgeProps) {
    const [edgePath] = getPolylinePath({
        sourceX: props.sourceX, sourceY: props.sourceY,
        targetX: props.targetX, targetY: props.targetY,
        bends: props.data?.yData?.bends ?? []
    })
    return <BaseEdge path={edgePath} {...props} />
}
```

## Usage Example

Register the license once, then use the `useLayout` hook.

```tsx
import { ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, Panel } from '@xyflow/react'
import { MultiHandleNode, PolylineEdge, useLayout, registerLicense } from '@yworks/yfiles-layout-reactflow'
import yFilesLicense from './license.json'

registerLicense(yFilesLicense)

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { runLayout } = useLayout()

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={{ default: MultiHandleNode }} edgeTypes={{ default: PolylineEdge }}>
      <Panel position="top-left">
        <button onClick={() => runLayout('HierarchicalLayout')}>Run Layout</button>
      </Panel>
    </ReactFlow>
  )
}
```

## Custom Layouts

While `useLayout` is the preferred choice, you can use `useLayoutSupport` for direct `yfiles` library access if standard configurations are insufficient. For AI support when programming with `yfiles`, run `npx -y yfiles-dev-suite --help` to obtain the necessary tools.

## References

- Use the [component feature overview](references/features.md) to learn about available layout algorithms and how they are configured and applied.
- Use the [complete API documentation](references/api.md) for exact props, types, hooks, and configuration.
