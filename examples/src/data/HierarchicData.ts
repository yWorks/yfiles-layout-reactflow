import { Edge, Node } from 'reactflow'

export default {
  nodes: [
    {
      id: '1',
      data: { label: 'Node 0' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '2',
      data: { label: 'Group A' },
      position: { x: 0, y: 0 },
      className: 'group'
    },
    {
      id: '2a',
      data: { label: 'Node A.1' },
      position: { x: 0, y: 0 },
      parentNode: '2',
      className: 'node'
    },
    {
      id: '3',
      data: { label: 'Node 1' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '4',
      data: { label: 'Group B' },
      position: { x: 0, y: 0 },
      className: 'group'
    },
    {
      id: '4a',
      data: { label: 'Node B.1' },
      position: { x: 0, y: 0 },
      className: 'node',
      parentNode: '4',
      extent: 'parent'
    },
    {
      id: '4b',
      data: { label: 'Group B.A' },
      position: { x: 0, y: 0 },
      className: 'group',
      parentNode: '4'
    },
    {
      id: '4b1',
      data: { label: 'Node B.A.1' },
      position: { x: 0, y: 0 },
      className: 'node',
      parentNode: '4b'
    },
    {
      id: '4b2',
      data: { label: 'Node B.A.2' },
      position: { x: 0, y: 0 },
      className: 'node',
      parentNode: '4b'
    }
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2a-4a', source: '2a', target: '4a' },
    { id: 'e3-4b', source: '3', target: '4b' },
    { id: 'e4a-4b1', source: '4a', target: '4b1' },
    { id: 'e4a-4b2', source: '4a', target: '4b2' },
    { id: 'e4b1-4b2', source: '4b1', target: '4b2' }
  ]
} satisfies { nodes: Node[]; edges: Edge[] }
