import { Edge, Node } from '@xyflow/react'
import LabelComponent from '../labeled-layout/LabelComponent.tsx'

export default {
  nodes: [
    {
      id: '0',
      data: { label: 'Node Label 1' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '1',
      data: {
        label: 'A Multi-line Node Label',
        labelStyle: {
          color: '#1c4355',
          backgroundColor: '#b5dcee',
          borderRadius: 10,
          padding: 5
        }
      },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '2',
      data: {
        label: 'Node Label 2',
        labelStyle: {
          color: '#1c4355',
          backgroundColor: '#b5dcee',
          borderRadius: 10,
          padding: 10
        }
      },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '3',
      data: { label: 'Node Label 3' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '4',
      data: { label: LabelComponent() },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '5',
      data: {
        label: 'Small Label',
        labelStyle: {
          color: '#1c4355',
          backgroundColor: '#b5dcee',
          padding: '10px',
          borderRadius: 10
        }
      },
      position: { x: 0, y: 0 },
      className: 'small-node'
    },
    {
      id: '6',
      data: { label: 'Custom Node Label', className: 'custom-label' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '7',
      data: { label: 'Node Label 4' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '8',
      data: { label: 'Node Label 5' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '9',
      data: { label: 'Node Label 6' },
      position: { x: 0, y: 0 },
      className: 'node'
    },
    {
      id: '10',
      data: { label: 'Node Label 7' },
      position: { x: 0, y: 0 },
      className: 'node'
    }
  ],
  edges: [
    {
      id: 'e0',
      source: '0',
      target: '1',
      label: 'A Long Edge Label'
    },
    {
      id: 'e1',
      source: '0',
      target: '2',
      data: {
        labels: ['Center Label', 'Source Label', 'Target Label']
      }
    },
    {
      id: 'e2',
      source: '0',
      target: '3',
      data: { labels: [LabelComponent()] }
    },
    {
      id: 'e3',
      source: '0',
      target: '4',
      label: 'Edge Label',
      labelStyle: {
        color: '#1c4355',
        backgroundColor: '#b5dcee',
        borderRadius: 10,
        padding: 5
      },
      data: {
        labels: [
          {
            label: 'Edge Label 1',
            labelStyle: {
              color: 'white',
              backgroundColor: '#ca0c3b',
              borderRadius: 10,
              padding: 5
            }
          },
          'Edge Label 2'
        ]
      }
    },
    {
      id: 'e4',
      source: '1',
      target: '5',
      data: {
        labels: [
          {
            label: 'Styled Edge Label',
            labelStyle: {
              color: '#1c4355',
              backgroundColor: '#b5dcee',
              borderRadius: 10,
              padding: 5
            }
          }
        ]
      }
    },
    {
      id: 'e5',
      source: '5',
      target: '6',
      data: {
        labels: [
          {
            label: 'Styled Edge Label',
            className: 'custom-label'
          }
        ]
      }
    },
    {
      id: 'e6',
      source: '5',
      target: '7',
      label: 'Edge Label'
    },
    {
      id: 'e7',
      source: '5',
      target: '8',
      label: 'Edge Label'
    },
    {
      id: 'e8',
      source: '5',
      target: '9',
      label: 'Edge Label'
    },
    {
      id: 'e10',
      source: '5',
      target: '10',
      label: 'Edge Label'
    },
    {
      id: 'e11',
      source: '0',
      target: '10',
      data: { labels: ['Center Label', 'Source Label', 'Target Label'] }
    }
  ]
} satisfies { nodes: Node[]; edges: Edge[] }
