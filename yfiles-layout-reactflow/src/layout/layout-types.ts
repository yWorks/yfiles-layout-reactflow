/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDescriptor } from '@yfiles/yfiles'
import { ReactNode } from 'react'
import { Label, LabelBox } from '../components/Labels.tsx'
import { Position } from 'reactflow'

/**
 * The result of the layout algorithm that provides all the necessary information
 * to place the nodes and their handles, and arrange the labels.
 * This information will be stored in the `data.yData` of each node.
 */
export interface NodeLayoutData {
  /**
   * The layout information about the labels of a node or an edge.
   * This information will be used by the {@link NodeLabel} component.
   */
  labelBoxes: LabelBox[]
  /**
   * The id, the location and the side of the handle on the source node of the edge.
   * This information will be used by the {@link MultiHandleNode} to arrange the node
   * handles.
   */
  sourceHandles: { id: string; location: { x: number; y: number }; position: Position }
  /**
   * The id, the location and the side of the handle on the target node of the edge.
   * This information will be used by the {@link MultiHandleNode} to arrange the node
   * handles.
   */
  targetHandles: { id: string; location: { x: number; y: number }; position: Position }
}

/**
 * The result of the layout algorithm, which provides all the necessary information
 * to route the edges and arrange the labels.
 * This information will be stored in the `data.yData` of each edge.
 */
export interface EdgeLayoutData {
  /**
   * The bend points of an edge.
   * This information will be used by the {@link PolylineEdge} to draw the edge path.
   */
  bends: { x: number; y: number }[]
  /**
   * The layout information about the labels of a node or an edge.
   * This information will be used by the {@link EdgeLabels} component.
   */
  labelBoxes: LabelBox[]
  /**
   * The coordinates of an edge's source point relative to its source node's center.
   * This information will be used by the {@link PolylineEdge} to draw the edge path.
   */
  sourcePoint: { x: number; y: number }
  /**
   * The coordinates of an edge's target point relative to its target node's center.
   * This information will be used by the {@link PolylineEdge} to draw the edge path.
   */
  targetPoint: { x: number; y: number }
}

/**
 * The names of the layout algorithms {@link useLayout} supports.
 */
export type LayoutName =
  | 'GenericLabeling'
  | 'RadialTreeLayout'
  | 'HierarchicalLayout'
  | 'CircularLayout'
  | 'OrganicLayout'
  | 'OrthogonalLayout'
  | 'EdgeRouter'
  | 'RadialLayout'
  | 'TreeLayout'

/**
 * All configurations for the layout algorithms supported by {@link useLayout}.
 */
export type LayoutAlgorithmConfiguration = LayoutDescriptor & { name: LayoutName }

/**
 * The properties that describe a label to the layout algorithm.
 */
export interface LabelData {
  /** The label representation in the data. */
  data: string | Label | ReactNode
  /** The index of the label in the list of labels attached to the same node or edge. */
  labelIndex: number
  /** The id of the associated node or edge. */
  ownerId: string
}

/**
 * Represents margins for nodes, i.e., a rectangular area around each node in which no other graph
 * elements can be placed during the layout. If only a number is specified, the margins extend the same on all sides.
 */
export type NodeMargins = { top: number; left: number; bottom: number; right: number } | number

/**
 * Represents the padding for a group node, i.e., a rectangular area inside the group node.
 * If only a number is specified, the padding on all sides are the same.
 */
export type Insets = { top: number; left: number; bottom: number; right: number } | number

/**
 * The port sides supported by layout data providers in {@link useLayout}.
 */
export type PortSides =
  | 'end-in-flow'
  | 'any'
  | 'right'
  | 'left-in-flow'
  | 'top'
  | 'right-in-flow'
  | 'bottom'
  | 'left'
  | 'start-in-flow'

/**
 * A descriptor for the placement of an edge label.
 */
export interface EdgeLabelPreferredPlacement {
  /** The rotation angle of the label. */
  angle?: number
  /** Whether to interpret the rotation angle relative to the edge direction. */
  angleReference?: 'absolute' | 'relative-to-edge-flow'
  /** The preferred distance between a label and the corresponding edge segment. */
  distanceToEdge?: number
  /** Whether to place the label left, right, or on the edge. */
  edgeSide?: 'left-of-edge' | 'on-edge' | 'right-of-edge'
  /** Whether to place the label at the center, source, or target of the edge. */
  placementAlongEdge?: 'at-source' | 'at-center' | 'at-target'
}

/**
 * A provider for child order comparators.
 *
 * For more information, see [ChildOrderData]{@link https://docs.yworks.com/yfileshtml/#/api/ChildOrderData}.
 */
export interface ChildOrderDataProvider<TNodeData, TEdgeData> {
  /** Provides which edge should come first. */
  outEdgeComparators?: (node: TNodeData) => (edge1: TEdgeData, edge2: TEdgeData) => number
}

/**
 * A provider for port data.
 *
 * For more information, see [PortData]{@link https://docs.yworks.com/yfileshtml/#/api/PortData}.
 */
export interface PortDataProvider<TEdgeData> {
  /** Provides ids to align the source ports of edges at the same node. */
  sourcePortAlignmentIds?: (edge: TEdgeData) => any
  /** Provides the sides of a node at which the edge should start. */
  sourcePortCandidates?: (edge: TEdgeData) => PortSides[]
  /** Provides ids to group edges at their source. */
  sourcePortGroupIds?: (edge: TEdgeData) => any
  /** Provides ids to align the target ports of edges at the same node. */
  targetPortAlignmentIds?: (edge: TEdgeData) => any
  /** Provides the sides of a node at which the edge should end. */
  targetPortCandidates?: (edge: TEdgeData) => PortSides[]
  /** Provides ids to group edges at their target. */
  targetPortGroupIds?: (edge: TEdgeData) => any
}

/**
 * A provider for individual options per nodes or edges in a
 * [Labeling]{@link https://docs.yworks.com/yfileshtml/#/api/GenericLabeling}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [LabelingData]{@link https://docs.yworks.com/yfileshtml/#/api/GenericLabelingData}.
 */
export interface GenericLabelingDataProvider {
  /** Provides which labels should be placed. */
  affectedLabels?: (label: LabelData) => boolean
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
}

/**
 * A provider for individual options per nodes or edges in a
 * [RadialTreeLayoutLayout]{@link https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [RadialTreeLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayoutData}.
 */
export interface RadialTreeLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides an order for the given edges in which the edges are arranged at a node. */
  childOrder?: ChildOrderDataProvider<TNodeData, TEdgeData>
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
}

/**
 * A provider for individual options per nodes or edges in a
 * [HierarchicalLayout]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [HierarchicalLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData}.
 */
export interface HierarchicalLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. */
  edgeDirectedness?: (edge: TEdgeData) => number
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides a numerical value that represents the thickness of an edge. */
  edgeThickness?: (edge: TEdgeData) => number
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margin for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides information about how an edge connects to its nodes. */
  ports?: PortDataProvider<TEdgeData>
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
}

/**
 * A provider for individual options per nodes or edges in a
 * [CircularLayout]{@link https://docs.yworks.com/yfileshtml/#/api/CircularLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [CircularLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/CircularLayoutData}.
 */
export interface CircularLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. */
  edgeDirectedness?: (edge: TEdgeData) => number
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
}

/**
 * A provider for scope options in [OrganicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [OrganicScopeData]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicScopeData}.
 */
export interface OrganicScopeDataProvider<TNodeData> {
  /** Provides how group nodes are handled. */
  groupNodeHandlingPolicies?: (node: TNodeData) => 'fix-bounds' | 'fix-contents' | 'free'
  /** Provides which nodes should be placed. */
  nodes?: (node: TNodeData) => boolean
  /** Provides when to place a node. */
  scopeModes?: (node: TNodeData) => 'affected' | 'fixed' | 'include-close-nodes' | 'include-extended-neighborhood'
}

/**
 * A provider for individual options per nodes or edges in a
 * [OrganicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [OrganicLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData}.
 */
export interface OrganicLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides the minimal length that an edge should have. */
  minimumEdgeLengths?: (edge: TEdgeData) => number
  /** Provides the minimal distance from a node to all other nodes. */
  minimumNodeDistances?: (node: TNodeData) => number
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides the preferred length for an edge. It is not mandatory but works as a guidance length. */
  preferredEdgeLengths?: (edge: TEdgeData) => number
  /** Provides which nodes should be placed. */
  scope?: OrganicScopeDataProvider<TNodeData>
}

/**
 * A provider for individual options per nodes or edges in a
 * [OrthogonalLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [OrthogonalLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayoutData}.
 */
export interface OrthogonalLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. */
  edgeDirectedness?: (edge: TEdgeData) => number
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
}

/**
 * A provider for scope options in [EdgeRouter]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouter}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [EdgeRouterScopeData]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouterScopeData}.
 */
export interface EdgeRouterScopeDataProvider<TNodeData, TEdgeData> {
  /** Provides which edges should be routed. */
  edges?: (edge: TEdgeData) => boolean
  /** Provides at which nodes edges should be routed. */
  incidentNodes?: (node: TNodeData) => boolean
}

/**
 * A provider for individual options per nodes or edges in a
 * [EdgeRouter]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouter}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [EdgeRouterData]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData}.
 */
export interface EdgeRouterDataProvider<TNodeData, TEdgeData> {
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides information about how an edge connects to its nodes. */
  ports?: PortDataProvider<TEdgeData>
  /** Provides which edges should be routed. */
  scope?: EdgeRouterScopeDataProvider<TNodeData, TEdgeData>
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
}

/**
 * A provider for individual options per nodes or edges in a
 * [RadialLayout]{@link https://docs.yworks.com/yfileshtml/#/api/RadialLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [RadialLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/RadialLayoutData}.
 */
export interface RadialLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides which nodes should be placed on the innermost circle. */
  centerNodes?: (node: TNodeData) => boolean
  /** Provides an order for outgoing edges at the given node in which the edges are arranged. */
  childOrder?: ChildOrderDataProvider<TNodeData, TEdgeData>
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
}

/**
 * A provider for individual options per nodes or edges in a
 * [TreeLayout]{@link https://docs.yworks.com/yfileshtml/#/api/TreeLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [TreeLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData}.
 */
export interface TreeLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides which nodes should be placed separately from their siblings. */
  assistantNodes?: (node: TNodeData) => boolean
  /** Provides an order for outgoing edges at the given node in which the edges are arranged. */
  childOrder?: ChildOrderDataProvider<TNodeData, TEdgeData>
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacements?: (label: LabelData) => EdgeLabelPreferredPlacement
  /** Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodePadding?: (node: TNodeData) => Insets
  /** Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeMargins?: (node: TNodeData) => NodeMargins
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
}

/**
 * All providers for the additional data for layout algorithms supported by {@link useLayout}.
 */
export type LayoutDataProvider<TNodeData, TEdgeData> =
  | GenericLabelingDataProvider
  | RadialTreeLayoutDataProvider<TNodeData, TEdgeData>
  | HierarchicalLayoutDataProvider<TNodeData, TEdgeData>
  | CircularLayoutDataProvider<TNodeData, TEdgeData>
  | OrganicLayoutDataProvider<TNodeData, TEdgeData>
  | OrthogonalLayoutDataProvider<TNodeData, TEdgeData>
  | EdgeRouterDataProvider<TNodeData, TEdgeData>
  | RadialLayoutDataProvider<TNodeData, TEdgeData>
  | TreeLayoutDataProvider<TNodeData, TEdgeData>
