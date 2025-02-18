import { ComponentType } from 'react'
import NodeEdgeTypes from './node-edge-types'
import ConfiguredLayout from './configured-layout'
import CustomLayout from './custom-layout'
import GroupedLayout from './grouped-layout'
import LabeledLayout from './labeled-layout'
import WebWorkerLayout from './web-worker-layout'
import OptionPanel from './option-panel'
import Test from './test'

export interface IRoute {
  title: string
  description: string
  path: string
  component: ComponentType
}

const routes: IRoute[] = [
  {
    title: 'Node and Edge Types',
    description: 'Node and edge type wrappers that support yFiles layout',
    path: 'node-edge-types',
    component: NodeEdgeTypes
  },
  {
    title: 'Configured Layout',
    description: 'Using the layout hook to apply a different layout configurations',
    path: 'simple-layout',
    component: ConfiguredLayout
  },
  {
    title: 'Custom Layout',
    description: 'Run a custom layout',
    path: 'custom-layout',
    component: CustomLayout
  },
  {
    title: 'Grouped Layout',
    description: 'Run a layout with group nodes',
    path: 'grouped-layout',
    component: GroupedLayout
  },
  {
    title: 'Label Layout',
    description: 'Run a layout with labels',
    path: 'labeled-layout',
    component: LabeledLayout
  },
  {
    title: 'Web Worker layout',
    description: 'Run a layout in a Web Worker',
    path: 'web-worker-layout',
    component: WebWorkerLayout
  },
  {
    title: 'Option Panel',
    description: 'Change layout settings interactively',
    path: 'option-panel',
    component: OptionPanel
  },
  {
    title: 'Test',
    description: 'test the layout configurations',
    path: 'test',
    component: Test
  }
]

export default routes
