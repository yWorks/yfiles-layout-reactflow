import {
  BalloonLayoutData,
  CircularLayoutData,
  EdgeRouterData,
  GenericLayoutData,
  GroupingKeys,
  HierarchicLayoutData,
  ICollection,
  IEdge,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  LabelingData,
  LayoutData,
  LayoutDescriptor,
  NodeHalo as YFilesNodeHalo,
  OrganicLayoutData,
  OrthogonalLayoutData,
  PortCandidate,
  PreferredPlacementDescriptor as YFilesPreferredPlacementDescriptor,
  RadialLayoutData,
  TreeLayoutData,
  YInsets
} from 'yfiles'
import {
  Insets,
  LayoutDataProvider,
  LayoutName,
  NodeHalo,
  PortDirections,
  PreferredPlacementDescriptor
} from './layout-types.ts'

export async function getLayoutAlgorithm(
  layoutDescriptor: LayoutDescriptor
): Promise<ILayoutAlgorithm> {
  switch (layoutDescriptor.name) {
    case 'GenericLabeling': {
      const { GenericLabeling } = await import('yfiles/layout-core')
      return new GenericLabeling(layoutDescriptor.properties)
    }
    case 'BalloonLayout': {
      const [{ BalloonLayout }, { TreeReductionStage }, { OrganicEdgeRouter }] = await Promise.all([
        import('yfiles/layout-core'),
        import('yfiles/layout-tree'),
        import('yfiles/router-other.js')
      ])
      return new TreeReductionStage({
        coreLayout: new BalloonLayout(layoutDescriptor.properties),
        nonTreeEdgeRouter: new OrganicEdgeRouter()
      })
    }
    case 'HierarchicLayout': {
      const { HierarchicLayout } = await import('yfiles/layout-hierarchic')
      return new HierarchicLayout(layoutDescriptor.properties)
    }
    case 'CircularLayout': {
      const { CircularLayout } = await import('yfiles/layout-organic')
      return new CircularLayout(layoutDescriptor.properties)
    }
    case 'OrganicLayout': {
      const { OrganicLayout } = await import('yfiles/layout-organic')
      return new OrganicLayout(layoutDescriptor.properties)
    }
    case 'OrthogonalLayout': {
      const { OrthogonalLayout } = await import('yfiles/layout-orthogonal')
      return new OrthogonalLayout(layoutDescriptor.properties)
    }
    case 'EdgeRouter': {
      const { EdgeRouter } = await import('yfiles/router-polyline')
      return new EdgeRouter(layoutDescriptor.properties)
    }
    case 'RadialLayout': {
      const { RadialLayout } = await import('yfiles/layout-radial')
      return new RadialLayout(layoutDescriptor.properties)
    }
    case 'TreeLayout': {
      const [{ TreeLayout, TreeReductionStage }, { EdgeRouter }] = await Promise.all([
        import('yfiles/layout-tree'),
        import('yfiles/router-polyline')
      ])
      return new TreeReductionStage({
        coreLayout: new TreeLayout(layoutDescriptor.properties),
        nonTreeEdgeRouter: new EdgeRouter()
      })
    }
    default: {
      const { OrganicLayout } = await import('yfiles/layout-organic')
      return new OrganicLayout()
    }
  }
}

export function getLayoutData<TNodeData, TEdgeData>(
  layoutName: LayoutName,
  layoutDataDescriptor?: LayoutDataProvider<TNodeData, TEdgeData>,
  reactFlowElement?: HTMLDivElement
): LayoutData | null {
  const layoutData = new GenericLayoutData({
    nodeItemMappings: [
      [
        GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
        (node: INode) =>
          // @ts-expect-error property-groupNodeInsets-does-not-exist-on-type-LayoutDataProvider
          translateInsets(node, layoutDataDescriptor?.groupNodeInsets?.(node.tag), reactFlowElement)
      ]
    ]
  })

  switch (layoutName) {
    case 'GenericLabeling':
      layoutData.add(new LabelingData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'BalloonLayout':
      layoutData.add(new BalloonLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
      break
    case 'HierarchicLayout':
      layoutData.add(new HierarchicLayoutData(translateLayoutDataDescriptor(layoutDataDescriptor)))
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
  const translatedLayoutDataDescriptor: { [key: string]: (item: IModelItem) => unknown } = {}
  Object.keys(layoutDataDescriptor).forEach((key: string) => {
    const originalFunction: (item: IModelItem) => unknown =
      layoutDataDescriptor[key as keyof LayoutDataProvider<TNodeData, TEdgeData>]
    if (originalFunction) {
      // @ts-expect-error property-groupNodeInsets-does-not-exist-on-type-LayoutDataProvider
      if (layoutDataDescriptor.groupNodeInsets) {
        return
      } else if (key === 'edgeLabelPreferredPlacement') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) =>
          translatePreferredPlacementDescriptor(
            originalFunction(item.tag) as PreferredPlacementDescriptor
          )
      } else if (key === 'nodeHalos') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) =>
          translateNodeHalo(originalFunction(item.tag) as NodeHalo)
      } else if (key === 'sourcePortCandidates' || key === 'targetPortCandidates') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) =>
          translatePortCandidates(originalFunction(item.tag) as unknown as PortDirections[])
      } else if (key === 'outEdgeComparers') {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) => translateOutEdgeComparers<TEdgeData>(originalFunction(item.tag) as (edge1: TEdgeData, edge2: TEdgeData) => number)
      } else {
        translatedLayoutDataDescriptor[key] = (item: IModelItem) => originalFunction(item.tag)
      }
    }
  })

  return translatedLayoutDataDescriptor
}

function translateOutEdgeComparers<TEdgeData>(outEdgeComparer: (edge1: TEdgeData, edge2: TEdgeData) => number) {
  console.log('translateOutEdgeComparers')
  return (e1: IEdge, e2: IEdge) => outEdgeComparer(e1.tag, e2.tag)
}

function translatePortCandidates(sides: PortDirections[]): ICollection<PortCandidate> {
  return ICollection.from(sides.map(side => PortCandidate.createCandidate(side)))
}

function translateNodeHalo(nodeHalo: NodeHalo): YFilesNodeHalo {
  if (typeof nodeHalo === 'number') {
    return YFilesNodeHalo.create(nodeHalo)
  }
  return YFilesNodeHalo.create(nodeHalo.top, nodeHalo.left, nodeHalo.bottom, nodeHalo.right)
}

function translateInsets(
  node: INode,
  insets?: Insets,
  reactFlowElement?: HTMLDivElement
): YInsets | null {
  if (insets) {
    if (typeof insets === 'number') {
      return new YInsets(insets, insets, insets, insets)
    }
    return new YInsets(insets.top, insets.left, insets.bottom, insets.right)
  }
  return getGroupNodeInsets(node, reactFlowElement)
}

function translatePreferredPlacementDescriptor(
  descriptor: PreferredPlacementDescriptor
): YFilesPreferredPlacementDescriptor {
  return new YFilesPreferredPlacementDescriptor(descriptor)
}

function getGroupNodeInsets(node: INode, reactFlowElement?: HTMLDivElement) {
  const root = getRootNode(reactFlowElement)
  const nodeElement = root.querySelector(`[data-id="${node.tag.id}"]`)
  if (nodeElement) {
    const computedStyle = window.getComputedStyle(nodeElement)
    const paddingTop = parseInt(computedStyle.getPropertyValue('padding-top')) ?? 0
    const paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left')) ?? 0
    const paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom')) ?? 0
    const paddingRight = parseInt(computedStyle.getPropertyValue('padding-right')) ?? 0
    return new YInsets(paddingTop, paddingLeft, paddingBottom, paddingRight)
  }
  return new YInsets(0, 0, 0, 0)
}

export function getRootNode(
  reactFlowElement?: HTMLDivElement
): Element | Document | DocumentFragment {
  if (reactFlowElement) {
    return reactFlowElement.getRootNode() as HTMLElement
  }

  const shadowRoots = Array.from(document.querySelectorAll('*'))
    .filter(e => !!e.shadowRoot)
    .map(e => e.shadowRoot)
  if (shadowRoots.length > 0) {
    return shadowRoots.at(0) as DocumentFragment
  }

  return document
}
