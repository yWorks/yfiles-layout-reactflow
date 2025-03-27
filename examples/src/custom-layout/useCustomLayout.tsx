import { useCallback } from 'react'
import { EdgePortCandidates, HierarchicalLayout, HierarchicalLayoutData, IEdge, PortSides } from '@yfiles/yfiles'
import { useLayoutSupport } from '@yworks/yfiles-layout-reactflow'
import { useReactFlow } from '@xyflow/react'

export function useCustomLayout() {
  const { getNodes, getEdges, setNodes, setEdges, fitView, getZoom } = useReactFlow()

  const { buildGraph, transferLayout } = useLayoutSupport()

  return useCallback(() => {
    // create a graph from data
    const graph = buildGraph(getNodes(), getEdges(), getZoom())

    // configure a layout
    const hierarchicalLayout = new HierarchicalLayout()
    const hierarchicalLayoutData = new HierarchicalLayoutData({
      ports: {
        sourcePortCandidates: (edge: IEdge) => {
          const candidates = new EdgePortCandidates()
          if (edge.tag.id === 'e0') {
            candidates.addFreeCandidate(PortSides.LEFT)
          } else if (edge.tag.id === 'e1') {
            candidates.addFreeCandidate(PortSides.RIGHT)
          } else {
            candidates.addFreeCandidate(PortSides.START_IN_FLOW)
          }
          return candidates
        }
      }
    })

    // apply the layout
    graph.applyLayout(hierarchicalLayout, hierarchicalLayoutData)

    // transfer the new coordinates to the data
    const { arrangedEdges, arrangedNodes } = transferLayout(graph)
    setNodes(arrangedNodes)
    setEdges(arrangedEdges)

    // fit the graph into the view
    setTimeout(() => fitView(), 100)
  }, [getNodes, getEdges, buildGraph, transferLayout, setNodes, setEdges, fitView, getZoom])
}
