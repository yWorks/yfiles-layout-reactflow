import {
  CircularLayout,
  CircularLayoutData,
  EdgeLabelPreferredPlacement as YFilesEdgeLabelPreferredPlacement,
  EdgePortCandidates,
  EdgeRouter,
  EdgeRouterData,
  GenericLabeling,
  GenericLabelingData,
  GenericLayoutData,
  HierarchicalLayout,
  HierarchicalLayoutData,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  Insets as YFilesInsets,
  LayoutData,
  LayoutDescriptor,
  LayoutKeys,
  OrganicEdgeRouter,
  OrganicLayout,
  OrganicLayoutData,
  OrthogonalLayout,
  OrthogonalLayoutData,
  RadialLayout,
  RadialLayoutData,
  RadialTreeLayout,
  RadialTreeLayoutData,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage
} from '@yfiles/yfiles'
import {
  ChildOrderDataProvider,
  EdgeLabelPreferredPlacement,
  EdgeRouterScopeDataProvider,
  Insets,
  LayoutDataProvider,
  LayoutName,
  OrganicScopeDataProvider,
  PortDataProvider,
  PortSides
} from './layout-types.ts'
import { RefObject } from 'react'

export async function getLayoutAlgorithm(
  layoutDescriptor: LayoutDescriptor
): Promise<ILayoutAlgorithm> {
  switch (layoutDescriptor.name) {
    case 'GenericLabeling': {
      return new GenericLabeling(layoutDescriptor.properties ?? {})
    }
    case 'RadialTreeLayout': {
      return new TreeReductionStage({
        coreLayout: new RadialTreeLayout(layoutDescriptor.properties ?? {}),
        nonTreeEdgeRouter: new OrganicEdgeRouter()
      })
    }
    case 'HierarchicalLayout': {
      return new HierarchicalLayout(layoutDescriptor.properties ?? {})
    }
    case 'CircularLayout': {
      return new CircularLayout(layoutDescriptor.properties ?? {})
    }
    case 'OrganicLayout': {
      return new OrganicLayout(layoutDescriptor.properties ?? {})
    }
    case 'OrthogonalLayout': {
      return new OrthogonalLayout(layoutDescriptor.properties ?? {})
    }
    case 'EdgeRouter': {
      return new EdgeRouter(layoutDescriptor.properties ?? {})
    }
    case 'RadialLayout': {
      return new RadialLayout(layoutDescriptor.properties ?? {})
    }
    case 'TreeLayout': {
      return new TreeReductionStage({
        coreLayout: new TreeLayout(layoutDescriptor.properties ?? {}),
        nonTreeEdgeRouter: new EdgeRouter()
      })
    }
    default: {
      return new OrganicLayout()
    }
  }
}

export function getLayoutData<TNodeData, TEdgeData>(
  layoutName: LayoutName,
  layoutDataDescriptor?: LayoutDataProvider<TNodeData, TEdgeData>,
  reactFlowRef?: RefObject<HTMLElement>
): LayoutData | null {
  const layoutData = new GenericLayoutData()
  const rootElement = getRootNode(reactFlowRef)
  layoutData.addItemMapping(LayoutKeys.GROUP_NODE_PADDING_DATA_KEY, (node: INode) =>
    // @ts-expect-error property-groupNodePadding-does-not-exist-on-type-LayoutDataProvider
    translatePadding(rootElement, node, layoutDataDescriptor?.groupNodePadding?.(node.tag))
  )

  switch (layoutName) {
    case 'GenericLabeling':
      layoutData.add(new GenericLabelingData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'RadialTreeLayout':
      layoutData.add(new RadialTreeLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'HierarchicalLayout':
      layoutData.add(
        new HierarchicalLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor))
      )
      break
    case 'CircularLayout':
      layoutData.add(new CircularLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'OrganicLayout':
      layoutData.add(new OrganicLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'OrthogonalLayout':
      layoutData.add(new OrthogonalLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'EdgeRouter':
      layoutData.add(new EdgeRouterData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'RadialLayout':
      layoutData.add(new RadialLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'TreeLayout':
      layoutData.add(new TreeLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    default:
  }

  return layoutData
}

function translateLayoutDataDescriptor<TNodeData, TEdgeData>(
  layoutDataDescriptor?: LayoutDataProvider<TNodeData, TEdgeData>
): object {
  if (!layoutDataDescriptor) {
    return {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translatedLayoutDataDescriptor: {
    [key: string]:
      | ((item: IModelItem) => unknown)
      | { [key: string]: (item: IModelItem) => unknown }
      | {
          [key: string]: (item: IModelItem) => (item1: IModelItem, item2: IModelItem) => unknown
        }
  } = {}
  Object.keys(layoutDataDescriptor).forEach((key: string) => {
    const originalFunction: (item: IModelItem) => unknown =
      layoutDataDescriptor[key as keyof LayoutDataProvider<TNodeData, TEdgeData>]
    if (originalFunction) {
      // @ts-expect-error property-groupNodePadding-does-not-exist-on-type-LayoutDataProvider
      if (layoutDataDescriptor.groupNodePadding) {
        return (translatedLayoutDataDescriptor.groupNodePadding = (item: IModelItem) =>
          translateNodeMargins(originalFunction(item.tag) as Insets))
      } else if (key === 'edgeLabelPreferredPlacements') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) =>
          translateEdgeLabelPreferredPlacement(
            originalFunction(item.tag) as EdgeLabelPreferredPlacement
          )
      } else if (key === 'nodeMargins') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) =>
          translateNodeMargins(originalFunction(item.tag) as Insets)
      } else if (key === 'ports') {
        translatedLayoutDataDescriptor[key] = translatePortDataProvider(
          // @ts-expect-error property-ports-does-not-exist-on-type-LayoutDataProvider
          layoutDataDescriptor[key] as PortDataProvider<TEdgeData>
        )
      } else if (key === 'childOrder') {
        translatedLayoutDataDescriptor[key] = translateChildOrderDataProvider(
          // @ts-expect-error property-childOrder-does-not-exist-on-type-LayoutDataProvider
          layoutDataDescriptor[key] as ChildOrderDataProvider<TNodeData, TEdgeData>
        )
      } else if (key === 'scope') {
        translatedLayoutDataDescriptor[key] = translateScopeDataProvider(
          // @ts-expect-error property-scope-does-not-exist-on-type-LayoutDataProvider
          layoutDataDescriptor[key] as
            | OrganicScopeDataProvider<TNodeData>
            | EdgeRouterScopeDataProvider<TNodeData, TEdgeData>
        )
      } else {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) => originalFunction(item.tag)
      }
    }
  })

  return translatedLayoutDataDescriptor
}

function translateChildOrderDataProvider<TNodeData, TEdgeData>(
  childOrder: PortDataProvider<TEdgeData>
): {
  [key: string]: (item: IModelItem) => (item1: IModelItem, item2: IModelItem) => unknown
} {
  const translatedChildOrderData: {
    [key: string]: (item: IModelItem) => (item1: IModelItem, item2: IModelItem) => unknown
  } = {}
  Object.keys(childOrder).forEach((key: string) => {
    const originalFunction: (item: IModelItem) => unknown =
      childOrder[key as keyof LayoutDataProvider<TNodeData, TEdgeData>]
    translatedChildOrderData[key] = (node: IModelItem) =>
      translateOutEdgeComparers<TEdgeData>(
        originalFunction(node.tag) as (edge1: TEdgeData, edge2: TEdgeData) => number
      )
  })
  return translatedChildOrderData
}

function translateOutEdgeComparers<TEdgeData>(
  outEdgeComparer: (edge1: TEdgeData, edge2: TEdgeData) => number
): (item1: IModelItem, item2: IModelItem) => number {
  return (e1: IModelItem, e2: IModelItem) => outEdgeComparer(e1.tag, e2.tag)
}

function translatePortDataProvider<TNodeData, TEdgeData>(
  ports: PortDataProvider<TEdgeData>
): {
  [key: string]: (item: IModelItem) => unknown
} {
  const translatedPortData: { [key: string]: (item: IModelItem) => unknown } = {}
  Object.keys(ports).forEach((key: string) => {
    const originalFunction: (item: IModelItem) => unknown =
      ports[key as keyof LayoutDataProvider<TNodeData, TEdgeData>]
    translatedPortData[key] =
      key === 'sourcePortCandidates' || key === 'targetPortCandidates'
        ? (item: IModelItem) =>
            translatePortCandidates(originalFunction(item.tag) as unknown as PortSides[])
        : (item: IModelItem) => originalFunction(item.tag)
  })
  return translatedPortData
}

function translatePortCandidates(sides: PortSides[]): EdgePortCandidates {
  const portCandidates = new EdgePortCandidates()
  sides.forEach(side => {
    portCandidates.addFreeCandidate(side)
  })
  return portCandidates
}

function translateScopeDataProvider<TNodeData, TEdgeData>(
  scope: OrganicScopeDataProvider<TNodeData> | EdgeRouterScopeDataProvider<TNodeData, TEdgeData>
): {
  [key: string]: (item: IModelItem) => unknown
} {
  const translatedScopeData: { [key: string]: (item: IModelItem) => unknown } = {}
  Object.keys(scope).forEach((key: string) => {
    const originalFunction: (item: IModelItem) => unknown =
      scope[key as keyof LayoutDataProvider<TNodeData, TEdgeData>]
    translatedScopeData[key] = (item: IModelItem) => originalFunction(item.tag)
  })
  return translatedScopeData
}

function translateNodeMargins(insets: Insets | number): YFilesInsets {
  if (typeof insets === 'number') {
    return new YFilesInsets(insets)
  }
  return new YFilesInsets(insets.top, insets.right, insets.bottom, insets.left)
}

function translatePadding(
  rootElement: HTMLElement,
  node: INode,
  insets?: Insets
): YFilesInsets | null {
  if (insets) {
    if (typeof insets === 'number') {
      return new YFilesInsets(insets, insets, insets, insets)
    }
    return new YFilesInsets(insets.top, insets.right, insets.bottom, insets.left)
  }
  return getGroupNodePadding(node, rootElement)
}

function translateEdgeLabelPreferredPlacement(
  descriptor: EdgeLabelPreferredPlacement
): YFilesEdgeLabelPreferredPlacement {
  return new YFilesEdgeLabelPreferredPlacement(descriptor)
}

function getGroupNodePadding(node: INode, rootElement: HTMLElement): YFilesInsets {
  const nodeElement = rootElement.querySelector(`[data-id="${node.tag.id}"]`)
  if (nodeElement) {
    const computedStyle = window.getComputedStyle(nodeElement)
    const paddingTop = parseInt(computedStyle.getPropertyValue('padding-top')) ?? 0
    const paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left')) ?? 0
    const paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom')) ?? 0
    const paddingRight = parseInt(computedStyle.getPropertyValue('padding-right')) ?? 0
    return new YFilesInsets(paddingTop, paddingLeft, paddingBottom, paddingRight)
  }
  return new YFilesInsets(0, 0, 0, 0)
}

export function getRootNode(
  reactFlowRef?: RefObject<HTMLElement>
): Element | Document | DocumentFragment {
  if (reactFlowRef?.current) {
    return reactFlowRef.current.getRootNode() as HTMLElement
  }

  const shadowRoots = Array.from(document.querySelectorAll('*'))
    .filter(e => !!e.shadowRoot)
    .map(e => e.shadowRoot)
  if (shadowRoots.length > 0) {
    if (shadowRoots.length > 1) {
      console.warn(
        'There are more than one shadow roots. For correct results, please call useLayout or useLayoutSupport with a reference to the corresponding reactflow component.'
      )
    }
    return shadowRoots.at(0) as DocumentFragment
  }

  return document
}
