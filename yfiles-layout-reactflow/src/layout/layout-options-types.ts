import {
  CircularLayoutEdgeDescriptor,
  CircularLayoutExteriorEdgeDescriptor,
  EdgeRouterEdgeDescriptor,
  HierarchicalLayoutEdgeDescriptor,
  HierarchicalLayoutNodeDescriptor,
  ISubtreePlacer,
  LabelingCosts,
  OrthogonalLayoutEdgeDescriptor,
  PartitionDescriptor
} from '@yfiles/yfiles'

/**
 * All layout configurations supported by {@link useLayout}.
 */
export type LayoutAlgorithmOptions =
  | GenericLabelingOptions
  | RadialTreeLayoutOptions
  | HierarchicalLayoutOptions
  | CircularLayoutOptions
  | OrganicLayoutOptions
  | OrthogonalLayoutOptions
  | EdgeRouterOptions
  | RadialLayoutOptions
  | TreeLayoutOptions

/**
 * The configuration options for the labeling algorithm that places the labels of a graph.
 * <p>
 * For more information on the labeling algorithm and its available settings,
 * see [GenericLabeling]{@link https://docs.yworks.com/yfileshtml/#/api/GenericLabeling}.
 * </p>
 */
export interface GenericLabelingOptions {
  defaultEdgeLabelingCosts?: LabelingCosts
  defaultNodeLabelingCosts?: LabelingCosts
  deterministic?: boolean
  moveInternalNodeLabels?: boolean
  reduceLabelOverlaps?: boolean
  scope?: 'all' | 'edge-labels' | 'node-labels'
  stopDuration?: number
}

/**
 * The configuration options for the radial tree layout algorithm
 * that arranges the subtrees of the tree graph in a radial fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [RadialTreeLayout]{@link https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout}.
 * </p>
 */
export interface RadialTreeLayoutOptions {
  allowOverlaps?: boolean
  chainStraighteningMode?: boolean
  childAlignmentPolicy?: 'plain' | 'same-center' | 'compact' | 'smart'
  childOrderingPolicy?: 'compact' | 'symmetric' | 'from-sketch'
  compactnessFactor?: number
  edgeLabelPlacement?: 'generic' | 'ignore' | 'integrated'
  edgeLabelSpacing?: number
  minimumEdgeLength?: number
  minimumNodeDistance?: number
  nodeLabelPlacement?: 'consider' | 'generic' | 'horizontal' | 'ignore' | 'ray-like' | 'ray-like-leaves'
  nodeLabelSpacing?: number
  preferredChildSectorAngle?: number
  preferredRootSectorAngle?: number
  rootSelectionPolicy?: 'directed-root' | 'center-root' | 'weighted-center-root'
}

/**
 * The configuration options for the hierarchic layout algorithm that arranges graphs in a hierarchic fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [HierarchicalLayout]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout}.
 * </p>
 */
export interface HierarchicalLayoutOptions {
  automaticEdgeGrouping?: boolean
  componentArrangementPolicy?: 'compact' | 'topmost'
  defaultEdgeDescriptor?: HierarchicalLayoutEdgeDescriptor
  defaultNodeDescriptor?: HierarchicalLayoutNodeDescriptor
  edgeDistance?: number
  edgeLabelPlacement?: 'generic' | 'ignore' | 'integrated'
  fromScratchLayeringStrategy?:
    | 'hierarchical-topmost'
    | 'hierarchical-optimal'
    | 'hierarchical-tight-tree'
    | 'hierarchical-downshift'
    | 'bfs'
    | 'from-sketch'
    | 'user-defined'
    | 'unknown'
  fromSketchMode?: boolean
  gridSpacing?: number
  groupAlignmentPolicy?: 'top' | 'center' | 'bottom'
  groupLayeringPolicy?: 'ignore-groups' | 'recursive' | 'recursive-compact'
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  minimumLayerDistance?: number
  nodeDistance?: number
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore'
  nodeToEdgeDistance?: number
  stopDuration?: number
}

/**
 * The configuration options for the circular layout algorithm that arranges graphs in a circular fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [CircularLayout]{@link https://docs.yworks.com/yfileshtml/#/api/CircularLayout}.
 * </p>
 */
export interface CircularLayoutOptions {
  edgeDescriptor?: CircularLayoutEdgeDescriptor
  edgeRoutingPolicy?: 'interior' | 'automatic' | 'exterior'
  exteriorEdgeDescriptor?: CircularLayoutExteriorEdgeDescriptor
  fromSketchMode?: boolean
  maximumDeviationAngle?: number
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore' | 'ray-like' | 'ray-like-leaves' | 'horizontal'
  nodeLabelSpacing?: number
  partitionDescriptor?: PartitionDescriptor
  partitioningPolicy?: 'bcc-compact' | 'bcc-isolated' | 'single-cycle'
  placeChildrenOnCommonRadius?: boolean
  starSubstructureSize?: number
  starSubstructureStyle?: 'none' | 'radial' | 'separated-radial'
  starSubstructureTypeSeparation?: boolean
}

/**
 * The configuration options for the organic layout algorithm that arranges graphs in an organic fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [OrganicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayout}.
 * </p>
 */
export interface OrganicLayoutOptions {
  allowClusterAsGroupSubstructure?: boolean
  allowNodeOverlaps?: boolean
  automaticGroupNodeCompaction?: boolean
  avoidNodeEdgeOverlap?: boolean
  chainRecognition?: boolean
  chainSubstructureSize?: number
  chainSubstructureStyle?:
    | 'none'
    | 'rectangular'
    | 'rectangular-nested'
    | 'straight-line'
    | 'straight-line-nested'
    | 'disk'
    | 'disk-nested'
  circleRecognition?: boolean
  clusteringPolicy?:
    | 'none'
    | 'louvain-modularity'
    | 'edge-betweenness'
    | 'label-propagation'
    | 'user-defined'
  compactnessFactor?: number
  cycleSubstructureSize?: number
  cycleSubstructureStyle?: 'none' | 'circular' | 'circular-nested'
  defaultMinimumNodeDistance?: number
  defaultPreferredEdgeLength?: number
  deterministic?: boolean
  edgeLabelPlacement?: 'generic' | 'ignore' | 'integrated'
  groupNodeCompactness?: number
  groupSubstructureScope?:
    | 'no-groups'
    | 'groups-without-edges'
    | 'groups-without-inter-edges'
    | 'all-groups'
  groupSubstructureSize?: number
  groupSubstructureStyle?: 'circle' | 'compact-disk' | 'disk' | 'organic-disk'
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore'
  parallelSubstructureSize?: number
  parallelSubstructureStyle?: 'none' | 'rectangular' | 'radial' | 'straight-line'
  parallelSubstructureTypeSeparation?: boolean
  preferredMinimumNodeToEdgeDistance?: number
  qualityTimeRatio?: number
  starSubstructureSize?: number
  starSubstructureStyle?:
    | 'none'
    | 'radial'
    | 'radial-nested'
    | 'separated-radial'
    | 'circular'
    | 'circular-nested'
  starSubstructureTypeSeparation?: boolean
  stopDuration?: number
  treeSubstructureSize?: number
  treeSubstructureStyle?: 'none' | 'oriented' | 'radial' | 'radial-tree'
}

/**
 * The configuration options for the Orthogonal layout algorithm that arranges graphs in an orthogonal fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [OrthogonalLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout}.
 * </p>
 */
export interface OrthogonalLayoutOptions {
  alignDegreeOneNodes?: boolean
  chainSubstructureSize?: number
  chainSubstructureStyle?: 'none' | 'straight' | 'wrapped-with-nodes-at-turns' | 'wrapped-with-bends-at-turns'
  cycleSubstructureSize?: number
  cycleSubstructureStyle?: 'none' | 'circular' | 'circular-with-nodes-at-corners' | 'circular-with-bends-at-corners'
  defaultEdgeDescriptor?: OrthogonalLayoutEdgeDescriptor
  edgeLabelPlacement?: 'generic' | 'ignore' | 'integrated'
  fromSketchMode?: boolean
  gridSpacing?: number
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore'
  preferParallelRoutes?: boolean
  stopDuration?: number
  treeSubstructureOrientation?:
    | 'top-to-bottom'
    | 'bottom-to-top'
    | 'left-to-right'
    | 'right-to-left'
    | 'auto-detect'
  treeSubstructureSize?: number
  treeSubstructureStyle?: 'none' | 'default' | 'integrated' | 'compact' | 'aspect-ratio'
  uniformPortAssignment?: boolean
}

/**
 * The configuration options for the edge routing algorithm that applies polyline routes to the edges of the graph.
 * <p>
 * For more information on layout algorithm and its available settings,
 * see [EdgeRouter]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouter}.
 * </p>
 */
export interface EdgeRouterOptions {
  defaultEdgeDescriptor?: EdgeRouterEdgeDescriptor
  edgeLabelPlacement?: 'consider-unaffected-edge-labels' | 'generic' | 'ignore' | 'integrated'
  gridSpacing?: number
  minimumNodeToEdgeDistance?: number
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore' | 'ignore-group-labels'
  rerouting?: boolean
  stopDuration?: number
}

/**
 * The configuration options for the radial layout algorithm that arranges graphs in a radial fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [RadialLayout]{@link https://docs.yworks.com/yfileshtml/#/api/RadialLayout}.
 * </p>
 */
export interface RadialLayoutOptions {
  centerNodesPolicy?: 'directed' | 'centrality' | 'weighted-centrality'
  createControlPoints?: boolean
  edgeRoutingStyle?: 'polyline' | 'arc' | 'radial-polyline' | 'curved'
  layerSpacing?: number
  layeringStrategy?: 'bfs' | 'hierarchical' | 'dendrogram'
  maximumChildSectorAngle?: number
  minimumBendAngle?: number
  minimumEdgeDistance?: number
  minimumLayerDistance?: number
  minimumNodeDistance?: number
  minimumSectorDistance?: number
  nodeLabelPlacement?: 'consider' | 'generic' | 'horizontal' | 'ignore' | 'ray-like' | 'ray-like-leaves'
  nodeLabelSpacing?: number
}

/**
 * The configuration options for the tree layout algorithm that arranges graphs with a tree structure.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [TreeLayout]{@link https://docs.yworks.com/yfileshtml/#/api/TreeLayout}.
 * </p>
 */
export interface TreeLayoutOptions {
  allowMultiParent?: boolean
  defaultSubtreePlacer?: ISubtreePlacer
  edgeLabelPlacement?: 'generic' | 'ignore' | 'integrated'
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  nodeLabelPlacement?: 'consider' | 'generic' | 'ignore'
}
