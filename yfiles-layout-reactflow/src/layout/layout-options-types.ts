import {
  CircularLayoutEdgeLayoutDescriptor,
  ExteriorEdgeLayoutDescriptor,
  Grid,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutNodeLayoutDescriptor,
  ITreeLayoutNodePlacer,
  OrthogonalLayoutEdgeLayoutDescriptor
} from 'yfiles'

/**
 * All layout configurations supported by {@link useLayout}.
 */
export type LayoutAlgorithmOptions =
  | GenericLabelingOptions
  | BalloonLayoutOptions
  | HierarchicLayoutOptions
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
  deterministic?: boolean
  maximumDuration?: number
  customProfitModelRatio?: number
  optimizationStrategy?:
    | 'balanced'
    | 'node-overlap'
    | 'label-overlap'
    | 'edge-overlap'
    | 'preferred-placement'
    | 'partition-grid-overlap'
    | 'none'
  removeNodeOverlaps?: boolean
  removeEdgeOverlaps?: boolean
  reduceAmbiguity?: boolean
  moveInternalNodeLabels?: boolean
  reduceLabelOverlaps?: boolean
  placeNodeLabels?: boolean
  placeEdgeLabels?: boolean
  autoFlipping?: boolean
  edgeGroupOverlapAllowed?: boolean
}

/**
 * The configuration options for the balloon layout algorithm
 * that arranges the subtrees of the tree graph in a balloon-like fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [BalloonLayout]{@link https://docs.yworks.com/yfileshtml/#/api/BalloonLayout}.
 * </p>
 */
export interface BalloonLayoutOptions {
  childOrderingPolicy?: 'compact' | 'symmetric'
  minimumNodeDistance?: number
  fromSketchMode?: boolean
  rootNodePolicy?: 'directed-root' | 'center-root' | 'weighted-center-root' | 'selected-root'
  preferredChildWedge?: number
  preferredRootWedge?: number
  allowOverlaps?: boolean
  compactnessFactor?: number
  minimumEdgeLength?: number
  considerNodeLabels?: boolean
  interleavedMode?: 'off' | 'all-nodes' | 'marked-nodes'
  childAlignmentPolicy?: 'plain' | 'same-center' | 'compact' | 'smart'
  integratedNodeLabeling?: boolean
  integratedEdgeLabeling?: boolean
  nodeLabelingPolicy?: 'ray-like' | 'ray-like-leaves' | 'horizontal'
  nodeLabelSpacing?: number
  edgeLabelSpacing?: number
  chainStraighteningMode?: boolean
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the hierarchic layout algorithm that arranges graphs in a hierarchic fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [HierarchicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout}.
 * </p>
 */
export interface HierarchicLayoutOptions {
  groupAlignmentPolicy?: 'top' | 'center' | 'bottom'
  compactGroups?: boolean
  componentArrangementPolicy?: 'compact' | 'topmost'
  maximumDuration?: number
  recursiveGroupLayering?: boolean
  gridSpacing?: number
  backLoopRouting?: boolean
  backLoopRoutingForSelfLoops?: boolean
  automaticEdgeGrouping?: boolean
  orthogonalRouting?: boolean
  integratedEdgeLabeling?: boolean
  considerNodeLabels?: boolean
  minimumLayerDistance?: number
  stopAfterLayering?: boolean
  stopAfterSequencing?: boolean
  nodeToNodeDistance?: number
  nodeToEdgeDistance?: number
  edgeToEdgeDistance?: number
  separateLayers?: boolean
  fromScratchLayeringStrategy?:
    | 'hierarchical-topmost'
    | 'hierarchical-optimal'
    | 'hierarchical-tight-tree'
    | 'hierarchical-downshift'
    | 'bfs'
    | 'from-sketch'
    | 'user-defined'
    | 'unknown'
  layoutMode?: 'incremental' | 'from-scratch'
  edgeLayoutDescriptor?: HierarchicLayoutEdgeLayoutDescriptor
  nodeLayoutDescriptor?: HierarchicLayoutNodeLayoutDescriptor
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the circular layout algorithm that arranges graphs in a circular fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [CircularLayout]{@link https://docs.yworks.com/yfileshtml/#/api/CircularLayout}.
 * </p>
 */
export interface CircularLayoutOptions {
  considerNodeLabels?: boolean
  integratedNodeLabeling?: boolean
  nodeLabelSpacing?: number
  nodeLabelingPolicy?: 'ray-like' | 'ray-like-leaves' | 'horizontal'
  placeChildrenOnCommonRadius?: boolean
  fromSketchMode?: boolean
  starSubstructureStyle?: 'none' | 'radial' | 'separated-radial'
  starSubstructureSize?: number
  starSubstructureTypeSeparation?: boolean
  maximumDeviationAngle?: number
  layoutStyle?: 'bcc-compact' | 'bcc-isolated' | 'custom-groups' | 'single-cycle'
  partitionStyle?: 'cycle' | 'disk' | 'organic' | 'compact-disk'
  exteriorEdgeLayoutDescriptor?: ExteriorEdgeLayoutDescriptor
  defaultEdgeLayoutDescriptor?: CircularLayoutEdgeLayoutDescriptor
  edgeRoutingPolicy?: 'interior' | 'automatic' | 'exterior' | 'marked-exterior'
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the organic layout algorithm that arranges graphs in an organic fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [OrganicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayout}.
 * </p>
 */
export interface OrganicLayoutOptions {
  circleRecognition?: boolean
  chainRecognition?: boolean
  create3DLayout?: boolean
  groupNodeCompactness?: number
  automaticGroupNodeCompaction?: boolean
  clusterNodes?: boolean
  clusteringQuality?: number
  clusteringPolicy?:
    | 'none'
    | 'louvain-modularity'
    | 'edge-betweenness'
    | 'label-propagation'
    | 'user-defined'
  clusterAsGroupSubstructureAllowed?: boolean
  considerNodeLabels?: boolean
  integratedEdgeLabeling?: boolean
  smartComponentLayout?: boolean
  nodeEdgeOverlapAvoided?: boolean
  qualityTimeRatio?: number
  maximumDuration?: number
  scope?: 'all' | 'mainly-subset' | 'mainly-subset-geometric' | 'subset'
  chainSubstructureStyle?:
    | 'none'
    | 'rectangular'
    | 'rectangular-nested'
    | 'straight-line'
    | 'straight-line-nested'
    | 'disk'
    | 'disk-nested'
  cycleSubstructureStyle?: 'none' | 'circular' | 'circular-nested'
  parallelSubstructureStyle?: 'none' | 'rectangular' | 'radial' | 'straight-line'
  parallelSubstructureTypeSeparation?: boolean
  starSubstructureTypeSeparation?: boolean
  starSubstructureStyle?:
    | 'none'
    | 'radial'
    | 'radial-nested'
    | 'separated-radial'
    | 'circular'
    | 'circular-nested'
  treeSubstructureStyle?: 'none' | 'balloon' | 'oriented' | 'radial'
  groupSubstructureScope?:
    | 'no-groups'
    | 'groups-without-edges'
    | 'groups-without-inter-edges'
    | 'all-groups'
  cycleSubstructureSize?: number
  chainSubstructureSize?: number
  parallelSubstructureSize?: number
  starSubstructureSize?: number
  treeSubstructureSize?: number
  groupSubstructureSize?: number
  compactnessFactor?: number
  preferredEdgeLength?: number
  preferredMinimumNodeToEdgeDistance?: number
  considerNodeSizes?: boolean
  deterministic?: boolean
  minimumNodeDistance?: number
  nodeOverlapsAllowed?: boolean
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the Orthogonal layout algorithm that arranges graphs in an orthogonal fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [OrthogonalLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout}.
 * </p>
 */
export interface OrthogonalLayoutOptions {
  maximumDuration?: number
  uniformPortAssignment?: boolean
  treeStyle?: 'none' | 'default' | 'integrated' | 'compact' | 'aspect-ratio'
  treeSize?: number
  treeOrientation?:
    | 'top-to-bottom'
    | 'bottom-to-top'
    | 'left-to-right'
    | 'right-to-left'
    | 'auto-detect'
  chainStyle?: 'none' | 'straight' | 'wrapped-with-nodes-at-turns' | 'wrapped-with-bends-at-turns'
  chainSize?: number
  cycleStyle?: 'none' | 'circular-with-nodes-at-corners' | 'circular-with-bends-at-corners'
  cycleSize?: number
  preferParallelRoutes?: boolean
  edgeLayoutDescriptor?: OrthogonalLayoutEdgeLayoutDescriptor
  considerNodeLabels?: boolean
  integratedEdgeLabeling?: boolean
  randomization?: boolean
  alignDegreeOneNodes?: boolean
  faceMaximization?: boolean
  crossingReduction?: boolean
  optimizePerceivedBends?: boolean
  gridSpacing?: number
  layoutStyle?: 'normal' | 'uniform' | 'box' | 'mixed' | 'fixed-mixed' | 'fixed-box'
  edgeLengthReduction?: boolean
  fromSketchMode?: boolean
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the edge routing algorithm that applies polyline routes to the edges of the graph.
 * <p>
 * For more information on layout algorithm and its available settings,
 * see [EdgeRouter]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouter}.
 * </p>
 */
export interface EdgeRouterOptions {
  maximumDuration?: number
  integratedEdgeLabeling?: boolean
  polylineRouting?: boolean // Deprecated
  preferredPolylineSegmentLength?: number // Deprecated
  maximumPolylineSegmentRatio?: number // Deprecated
  rerouting?: boolean
  scope?: 'route-all-edges' | 'route-affected-edges' | 'route-edges-at-affected-nodes'
  considerNodeLabels?: boolean
  ignoreInnerNodeLabels?: boolean
  considerEdgeLabels?: boolean
  grid?: Grid | null
  minimumNodeToEdgeDistance?: number
}

/**
 * The configuration options for the radial layout algorithm that arranges graphs in a radial fashion.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [RadialLayout]{@link https://docs.yworks.com/yfileshtml/#/api/RadialLayout}.
 * </p>
 */
export interface RadialLayoutOptions {
  minimumNodeToNodeDistance?: number
  layerSpacing?: number
  minimumLayerDistance?: number
  maximumChildSectorAngle?: number
  minimumBendAngle?: number
  centerNodesPolicy?: 'directed' | 'centrality' | 'weighted-centrality' | 'custom'
  layeringStrategy?: 'bfs' | 'hierarchical' | 'dendrogram' | 'user-defined'
  edgeRoutingStrategy?: 'polyline' | 'arc' | 'radial-polyline' | 'curved'
  considerNodeLabels?: boolean
  minimumSectorDistance?: number
  createControlPoints?: boolean
  nodeLabelingPolicy?: 'ray-like' | 'ray-like-leaves' | 'horizontal'
  integratedNodeLabeling?: boolean
  nodeLabelSpacing?: number
  minimumEdgeToEdgeDistance?: number
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}

/**
 * The configuration options for the tree layout algorithm that arranges graphs with a tree structure.
 * <p>
 * For more information on the layout algorithm and its available settings,
 * see [TreeLayout]{@link https://docs.yworks.com/yfileshtml/#/api/TreeLayout}.
 * </p>
 */
export interface TreeLayoutOptions {
  groupingSupported?: boolean
  defaultNodePlacer?: ITreeLayoutNodePlacer
  defaultLeafPlacer?: ITreeLayoutNodePlacer
  considerNodeLabels?: boolean
  integratedEdgeLabeling?: boolean
  multiParentAllowed?: boolean
  orientationLayoutEnabled?: boolean
  layoutOrientation?: 'top-to-bottom' | 'left-to-right' | 'right-to-left' | 'bottom-to-top'
  selfLoopRouterEnabled?: boolean
  labelingEnabled?: boolean
  hideGroupsStageEnabled?: boolean
  componentLayoutEnabled?: boolean
  parallelEdgeRouterEnabled?: boolean
  subgraphLayoutEnabled?: boolean
}
