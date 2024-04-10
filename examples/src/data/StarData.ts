import { Edge, MarkerType, Node } from 'reactflow'

export default {
  nodes: [
    {
      id: '0',
      data: {  },
      position: { x: 0, y: 0 },
      type: 'custom'
    },
    {
      id: '1',
      data: { label: 'Node 1' },
      position: { x: 0, y: 0 }
    },
    {
      id: '2',
      data: { label: 'Node 2' },
      position: { x: 0, y: 0 }
    },
    {
      id: '3',
      data: { label: 'Node 3' },
      position: { x: 0, y: 0 }
    },
    {
      id: '4',
      data: { label: 'Node 4' },
      position: { x: 0, y: 0 }
    },
    {
      id: '5',
      data: { label: 'Node 5' },
      position: { x: 0, y: 0 }
    },
    {
      id: '6',
      data: { label: 'Node 6' },
      position: { x: 0, y: 0 }
    }
  ],
  edges: [
    { id: 'e0', source: '0', target: '1', markerEnd: MarkerType.ArrowClosed },
    { id: 'e1', source: '0', target: '2', markerEnd: MarkerType.ArrowClosed },
    { id: 'e2', source: '0', target: '3', markerEnd: MarkerType.ArrowClosed },
    { id: 'e3', source: '0', target: '4', markerEnd: MarkerType.ArrowClosed, type: 'custom' },
    { id: 'e4', source: '5', target: '0', markerEnd: MarkerType.ArrowClosed },
    { id: 'e5', source: '6', target: '0', markerEnd: MarkerType.ArrowClosed }
  ]
} satisfies { nodes: Node[]; edges: Edge[] }
