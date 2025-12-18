import { Edge, Node } from '@xyflow/react'

export default {
  nodes: [
    {
      id: '0',
      data: { label: 'Node 0' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '1',
      data: { label: 'Node 1' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '2',
      data: { label: 'Node 2' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '3',
      data: { label: 'Node 3' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '4',
      data: { label: 'Node 4' },
      position: { x: 0, y: 0 },
      className: 'node'
    }
  ],
  edges: [
    { id: 'e0', source: '0', target: '1' },
    { id: 'e1', source: '0', target: '2' },
    { id: 'e2', source: '0', target: '3' },
    { id: 'e3', source: '0', target: '4' }
  ]
} satisfies { nodes: Node[]; edges: Edge[] }
