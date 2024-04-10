import { useCallback } from 'react'
import {
  HierarchicLayout,
  HierarchicLayoutData,
  ICollection,
  IEdge,
  PortCandidate,
  PortDirections
} from 'yfiles'
import { useLayoutSupport } from '@yworks/yfiles-layout-reactflow'
import { useReactFlow } from 'reactflow'

export function useCustomLayout() {
  const { getNodes, getEdges, setNodes, setEdges, fitView, getZoom } = useReactFlow()

  const { buildGraph, transferLayout } = useLayoutSupport()

  return useCallback(() => {
    // create a graph from data
    const graph = buildGraph(getNodes(), getEdges(), getZoom())

    // configure a layout
    const hierarchicLayout = new HierarchicLayout()
    const hierarchicLayoutData = new HierarchicLayoutData({
      sourcePortCandidates: (edge: IEdge) => {
        if (edge.tag.id === 'e0') {
          return ICollection.from([PortCandidate.createCandidate(PortDirections.WEST)])
        } else if (edge.tag.id === 'e1') {
          return ICollection.from([PortCandidate.createCandidate(PortDirections.EAST)])
        }
        return ICollection.from([PortCandidate.createCandidate(PortDirections.WITH_THE_FLOW)])
      }
    })

    // apply the layout
    graph.applyLayout(hierarchicLayout, hierarchicLayoutData)

    // transfer the new coordinates to the data
    const { arrangedEdges, arrangedNodes } = transferLayout(graph)
    setNodes(arrangedNodes)
    setEdges(arrangedEdges)

    // fit the graph into the view
    setTimeout(() => fitView(), 100)
  }, [getNodes, getEdges, buildGraph, transferLayout, setNodes, setEdges, fitView, getZoom])
}
