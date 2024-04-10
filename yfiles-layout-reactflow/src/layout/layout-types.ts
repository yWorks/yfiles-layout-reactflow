/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDescriptor } from 'yfiles'
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
  /**
   * The layout information about the labels of a node or an edge.
   * This information will be used by the {@link NodeLabel} component.
   */
  labelBoxes: LabelBox[]
}
/**
 * The result of the layout algorithm, which provides all the necessary information
 * to route the edges and arrange the labels.
 * This information will be stored in the `data.yData` of each edge.
 */
export interface EdgeLayoutData {
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
}

/**
 * The names of the layout algorithms {@link useLayout} supports.
 */
export type LayoutName =
  | 'GenericLabeling'
  | 'BalloonLayout'
  | 'HierarchicLayout'
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
  /** The id of the associated node or edge. */
  ownerId: string
  /** The index of the label in the list of labels attached to the same node or edge. */
  labelIndex: number
  /** The label representation in the data. */
  data: string | Label | ReactNode
}

/**
 * Represents a halo for nodes, i.e., a rectangular area around each node in which no other graph
 * elements can be placed during the layout. If only a number is specified, the halo extends the same on all sides.
 */
export type NodeHalo = { top: number; left: number; bottom: number; right: number } | number

/**
 * Represents the insets for a group node, i.e., a rectangular area inside the group node.
 * If only a number is specified, the insets on all sides are the same.
 */
export type Insets = { top: number; left: number; bottom: number; right: number } | number

/**
 * The port directions supported by layout data providers in {@link useLayout}.
 */
export type PortDirections =
  | 'against-the-flow'
  | 'any'
  | 'east'
  | 'left-in-flow'
  | 'north'
  | 'right-in-flow'
  | 'south'
  | 'west'
  | 'with-the-flow'

/**
 * A descriptor for the placement of an edge label.
 */
export interface PreferredPlacementDescriptor {
  /** The rotation angle of the label. */
  angle?: number
  /** The preferred distance between a label and the corresponding edge segment. */
  distanceToEdge?: number
  /** Whether to place the label at the center, source, or target of the edge. */
  placeAlongEdge?: 'at-source' | 'at-center' | 'at-target'
  /** Whether to place the label left, right, or on the edge. */
  sideOfEdge?: 'left-of-edge' | 'on-edge' | 'right-of-edge'
  /** Whether to interpret the rotation angle relative to the edge direction. */
  angleReference?: 'absolute' | 'relative-to-edge-flow'
}

/**
 * A provider for individual options per nodes or edges in a
 * [Labeling]{@link https://docs.yworks.com/yfileshtml/#/api/GenericLabeling}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [LabelingData]{@link https://docs.yworks.com/yfileshtml/#/api/LabelingData}.
 */
export interface GenericLabelingDataProvider {
  /** Provides which labels should be placed. */
  affectedLabels?: (label: LabelData) => boolean
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
}

/**
 * A provider for individual options per nodes or edges in a
 * [BalloonLayout]{@link https://docs.yworks.com/yfileshtml/#/api/BalloonLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [BalloonLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/BalloonLayoutData}.
 */
export interface BalloonLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides an order for the given edges in which the edges are arranged at a node. */
  outEdgeComparer?: (edge1: TEdgeData, edge2: TEdgeData) => number
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
}

/**
 * A provider for individual options per nodes or edges in a
 * [HierarchicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [HierarchicLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutData}.
 */
export interface HierarchicLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. */
  edgeDirectedness?: (edge: TEdgeData) => number
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides a numerical value that represents the thickness of an edge. */
  edgeThickness?: (edge: TEdgeData) => number
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
  /** Provides the directions in which an edge can leave its source node. */
  sourcePortCandidates?: (edge: TEdgeData) => PortDirections[]
  /** Provides the directions in which an edge can enter its target node. */
  targetPortCandidates?: (edge: TEdgeData) => PortDirections[]
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
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
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
}

/**
 * A provider for individual options per nodes or edges in a
 * [OrganicLayout]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayout}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [OrganicLayoutData]{@link https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData}.
 */
export interface OrganicLayoutDataProvider<TNodeData, TEdgeData> {
  /** Provides which nodes should be placed. */
  affectedNodes?: (node: TNodeData) => boolean
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides the minimal length that an edge should have. */
  minimumEdgeLengths?: (edge: TEdgeData) => number
  /** Provides the minimal distance from a node to all other nodes. */
  minimumNodeDistances?: (node: TNodeData) => number
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides the preferred length for an edge. It is not mandatory but works as a guidance length. */
  preferredEdgeLengths?: (edge: TEdgeData) => number
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
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
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
}

/**
 * A provider for individual options per nodes or edges in a
 * [EdgeRouter]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouter}.
 * It allows for defining a function that provide values for each element.
 *
 * For more information, see [EdgeRouterData]{@link https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData}.
 */
export interface EdgeRouterDataProvider<TNodeData, TEdgeData> {
  /** Provides which edges should be routed. */
  affectedEdges?: (edge: TEdgeData) => boolean
  /** Provides if the edges of the given nodes should be routed. */
  affectedNodes?: (node: TNodeData) => boolean
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides which edges should be grouped at source, i.e., share the beginning of their routes. */
  sourceGroupIds?: (edge: TEdgeData) => any
  /** Provides which edges should be grouped at target, i.e., share the end of their routes. */
  targetGroupIds?: (edge: TEdgeData) => any
  /** Provides the directions in which an edge can leave its source node. */
  sourcePortCandidates?: (edge: TEdgeData) => PortDirections[]
  /** Provides the directions in which an edge can enter its target node. */
  targetPortCandidates?: (edge: TEdgeData) => PortDirections[]
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
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides an order for outgoing edges at the given node in which the edges are arranged. */
  outEdgeComparers?: (node: TNodeData) => (edge1: TEdgeData, edge2: TEdgeData) => number
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
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
  /** Provides descriptors for the placement of edge labels. */
  edgeLabelPreferredPlacement?: (label: LabelData) => PreferredPlacementDescriptor
  /** Provides halos for nodes, i.e., a rectangular area around a specific node considered during the layout. */
  nodeHalos?: (node: TNodeData) => NodeHalo
  /** Provides types which can influence the ordering of nodes during layout. */
  nodeTypes?: (node: TNodeData) => any
  /** Provides an order for outgoing edges at the given node in which the edges are arranged. */
  outEdgeComparers?: (node: TNodeData) => (edge1: TEdgeData, edge2: TEdgeData) => number
  /** Provides the insets the group nodes, i.e., a rectangular area like padding in the interior of the node. */
  groupNodeInsets?: (node: TNodeData) => Insets
}

/**
 * All providers for the additional data for layout algorithms supported by {@link useLayout}.
 */
export type LayoutDataProvider<TNodeData, TEdgeData> =
  | GenericLabelingDataProvider
  | BalloonLayoutDataProvider<TNodeData, TEdgeData>
  | HierarchicLayoutDataProvider<TNodeData, TEdgeData>
  | CircularLayoutDataProvider<TNodeData, TEdgeData>
  | OrganicLayoutDataProvider<TNodeData, TEdgeData>
  | OrthogonalLayoutDataProvider<TNodeData, TEdgeData>
  | EdgeRouterDataProvider<TNodeData, TEdgeData>
  | RadialLayoutDataProvider<TNodeData, TEdgeData>
  | TreeLayoutDataProvider<TNodeData, TEdgeData>
