## EdgeLabels


A component that renders edge labels with text that are placed at coordinates that resulted from a yFiles layout algorithm. At a single edge, there can be multiple edge labels which may be rotated.
 ```tsx
 export function CustomEdge(props: EdgeProps) {
   const [edgePath] = getPolylinePath({
     sourceX: props.sourceX,
     sourceY: props.sourceY,
     targetX: props.targetX,
     targetY: props.targetY,
     bends: props.data?.yData?.bends ?? []
   })

   return (
     <>
       <BaseEdge path={edgePath} {...props} />
       <EdgeLabelRenderer>
         <EdgeLabels
           labels={labels}
           ownerId={props.id}
           labelBoxes={props.data?.yData?.labelBoxes ?? []}
         ></EdgeLabels>
       </EdgeLabelRenderer>
     </>
   )
 }
 ```

## MultiHandleNode


A node component with multiple handles and a label that supports the results of a yFiles layout algorithm.

The information about the position of each handle will be given by the `data.yData` of each node, if any exists (see [NodeLayoutData](../types/nodelayoutdata)). Otherwise, handles will be placed on the top and on the bottom side of each node.
 ```tsx
 const nodeTypes = {
   handles: MultiHandleNode
 }

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
     ></ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```

## NodeLabel


A component that renders a node label with text that is placed at coordinates that resulted from a yFiles layout algorithm. Node labels can appear outside the node and be rotated. The text must be specified in `data.label` and the label box is retrieved from data.yData.labelBoxes.
 ```tsx
 export function CustomNode(props: NodeProps) {
   return (
     <>
       <NodeLabel {...props}></NodeLabel>
     </>
   )
 }
 ```

## PolylineEdge


An edge component that supports bends and the result of a yFiles layout algorithm.

The information about the edge path after running a layout algorithm will be given by the `data.yData` of each edge, see [EdgeLayoutData](../types/edgelayoutdata).
 ```tsx
 const edgeTypes = {
   polyline: PolylineEdge
 }

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       edgeTypes={edgeTypes}
     ></ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```

## withMultiHandles


A higher order component (hoc) that adds multiple handles to a node component, thus enabling this component for yFiles layout.
 ```tsx
 const CustomNode = () => (
   <div>Custom Node</div>
 )

 const nodeTypes = {
   custom: withMultiHandles(CustomNode)
 }

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
     ></ReactFlow>
   )
 }
 ```

## useLayout


A React hook that provides a callback to invoke the configured layout algorithm on the given data.
 ```tsx
 const edgeTypes = {
   default: PolylineEdge
 }

 const nodeTypes = {
   default: MultiHandleNode
 }

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   const { runLayout, running } = useLayout()

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
       edgeTypes={edgeTypes}
     >
       <Panel position="top-right">
         <button onClick={() => runLayout('OrthogonalLayout')} disabled={running}>Orthogonal Layout</button>
       </Panel>
     </ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```




      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="context">context?</div> | The context information for running the layout algorithm. | <pre>[LayoutContext](../types/layoutcontext)</pre>

### Returns
| Type | Description | 
|---|---|
| <pre>{<br>  runLayout: (<br>    configuration:<br>      &#124; [LayoutConfiguration](../types/layoutconfiguration)<br>      &#124; [LayoutName](../types/layoutname)<br>  ) =&gt; void<br>  running: boolean<br>}</pre> | Returns a function to invoke the layout algorithm and a running state that indicates whether a layout is currently calculated. |

## useLayoutSupport


A React hook that provides helper function that prepare the data for the layout algorithm and retrieve the result.

This hook is tailored for users interested in delving into [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html), exploring various layout algorithms, and crafting advanced layout code for their applications.
 ```tsx
 const edgeTypes = {
   default: PolylineEdge
 }

 const nodeTypes = {
   default: MultiHandleNode
 }

 const LayoutFlow = () => {
   const [nodes, setNodes] = useNodesState(initialNodes)
   const [edges, setEdges] = useEdgesState(initialEdges)
   const { fitView, getZoom } = useReactFlow()

   const { buildGraph, transferLayout } = useLayoutSupport()

   const runLayout = useCallback(() => {
     // create a graph from data
     const graph = buildGraph(nodes, edges, getZoom())

     // configure a layout
     const hierarchicalLayout = new HierarchicalLayout()
     const hierarchicalLayoutData = new HierarchicalLayoutData({
       ports: {
         sourcePortCandidates: (edge: IEdge) => {
           const candidates = new EdgePortCandidates()
           if (edge.tag.id === 'e0') {
             candidates.addFreeCandidate(PortSides.LEFT)
           } else if (edge.tag.id === 'e1') {
             candidates.addFreeCandidate(PortSides.RIGHT)
           } else {
             candidates.addFreeCandidate(PortSides.START_IN_FLOW)
           }
           return candidates
         }
       }
     })

     // apply the layout
     graph.applyLayout(hierarchicalLayout, hierarchicalLayoutData)

     // transfer the new coordinates to the data
     const { arrangedEdges, arrangedNodes } = transferLayout(graph)
     setNodes(arrangedNodes)
     setEdges(arrangedEdges)

     // fit the graph into the view
     fitView()
   }, [nodes, edges, buildGraph, transferLayout, setNodes, setEdges, fitView, getZoom])

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
       edgeTypes={edgeTypes}
     >
       <Panel position="top-right">
         <button onClick={runLayout}>Layout</button>
       </Panel>
     </ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```




      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="reactflowref">reactFlowRef?</div> | An optional reference to the React Flow element. This reference is particularly useful in scenarios where there are multiple React Flow elements on the same page or when the flow is encapsulated within a closed shadow DOM. | <pre>RefObject&lt;HTMLElement&gt;</pre>

### Returns
| Type | Description | 
|---|---|
| <pre>[LayoutSupport](../types/layoutsupport)</pre> | Returns functions to transfer the data into a graph and get the layout information from the graph. |

## useNodesMeasuredEffect


A React hook that executes the given callback when all nodes are measured by React Flow and have a size.
 ```tsx
 const edgeTypes = {
   default: PolylineEdge
 }

 const nodeTypes = {
   default: MultiHandleNode
 }

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   const { runLayout, running } = useLayout()

   // run initial layout after the nodes have been measured
   useNodesMeasuredEffect(() => {
     runLayout('OrthogonalLayout')
   })

   return (
     <ReactFlow
       nodes={nodes}
       edges={edges}
       nodeTypes={nodeTypes}
       edgeTypes={edgeTypes}
     ></ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```


      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="callback">callback</div> | A callback that is invoked when all nodes are measured. | <pre>() =&gt; void</pre>

## ChildOrderDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for child order comparators.

For more information, see [ChildOrderData](https://docs.yworks.com/yfileshtml/#/api/ChildOrderData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="outedgecomparators">outEdgeComparators?</div> |  Provides which edge should come first. | <pre>(<br>  node: TNodeData<br>) =&gt; (<br>  edge1: TEdgeData,<br>  edge2: TEdgeData<br>) =&gt; number</pre> |

## CircularLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [CircularLayout](https://docs.yworks.com/yfileshtml/#/api/CircularLayout). It allows for defining a function that provide values for each element.

For more information, see [CircularLayoutData](https://docs.yworks.com/yfileshtml/#/api/CircularLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## CircularLayoutOptions


The configuration options for the circular layout algorithm that arranges graphs in a circular fashion. <p> For more information on the layout algorithm and its available settings, see [CircularLayout](https://docs.yworks.com/yfileshtml/#/api/CircularLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="edgedescriptor">edgeDescriptor?</div> | <pre>CircularLayoutEdgeDescriptor</pre> |
| <div id="edgeroutingpolicy">edgeRoutingPolicy?</div> | <pre>"interior"<br>  &#124; "automatic"<br>  &#124; "exterior"</pre> |
| <div id="exterioredgedescriptor">exteriorEdgeDescriptor?</div> | <pre>CircularLayoutExteriorEdgeDescriptor</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="maximumdeviationangle">maximumDeviationAngle?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"<br>  &#124; "ray-like"<br>  &#124; "ray-like-leaves"<br>  &#124; "horizontal"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |
| <div id="partitiondescriptor">partitionDescriptor?</div> | <pre>PartitionDescriptor</pre> |
| <div id="partitioningpolicy">partitioningPolicy?</div> | <pre>"bcc-compact"<br>  &#124; "bcc-isolated"<br>  &#124; "single-cycle"</pre> |
| <div id="placechildrenoncommonradius">placeChildrenOnCommonRadius?</div> | <pre>boolean</pre> |
| <div id="starsubstructuresize">starSubstructureSize?</div> | <pre>number</pre> |
| <div id="starsubstructurestyle">starSubstructureStyle?</div> | <pre>"none"<br>  &#124; "radial"<br>  &#124; "separated-radial"</pre> |
| <div id="starsubstructuretypeseparation">starSubstructureTypeSeparation?</div> | <pre>boolean</pre> |

## EdgeData


The data that can be attached to an edge in the graph. This type extends the edge data with layout-specific information.

| Type | | 
|---|---|
|         | <pre>{<br>  yData?: [EdgeLayoutData](edgelayoutdata)<br>  labels?: string[]<br>}</pre> |

## EdgeLabelPreferredPlacement


A descriptor for the placement of an edge label.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="angle">angle?</div> |  The rotation angle of the label. | <pre>number</pre> |
| <div id="anglereference">angleReference?</div> |  Whether to interpret the rotation angle relative to the edge direction. | <pre>"absolute"<br>  &#124; "relative-to-edge-flow"</pre> |
| <div id="distancetoedge">distanceToEdge?</div> |  The preferred distance between a label and the corresponding edge segment. | <pre>number</pre> |
| <div id="edgeside">edgeSide?</div> |  Whether to place the label left, right, or on the edge. | <pre>"left-of-edge"<br>  &#124; "on-edge"<br>  &#124; "right-of-edge"</pre> |
| <div id="placementalongedge">placementAlongEdge?</div> |  Whether to place the label at the center, source, or target of the edge. | <pre>"at-source"<br>  &#124; "at-center"<br>  &#124; "at-target"</pre> |

## EdgeLabelsProps


The properties that describe the labels of an edge with their layout and styling.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="classname">className?</div> |  An optional CSS class used for styling the label. | <pre>string</pre> |
| <div id="labelboxes">labelBoxes</div> |  The layout information for the labels. | <pre>[LabelBox](labelbox)[]</pre> |
| <div id="labels">labels</div> |  The list of labels for the given edge. | <pre>(<br>  &#124; [Label](label)<br>  &#124; string<br>  &#124; ReactNode<br>)[]</pre> |
| <div id="labelstyle">labelStyle?</div> |  An optional CSS style used for the label. | <pre>CSSProperties</pre> |
| <div id="ownerid">ownerId</div> |  The id of the edge to which the labels belong. | <pre>string</pre> |

## EdgeLayoutData


The result of the layout algorithm, which provides all the necessary information to route the edges and arrange the labels. This information will be stored in the `data.yData` of each edge.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="bends">bends</div> |  The bend points of an edge. This information will be used by the [PolylineEdge](../components/polylineedge) to draw the edge path. | <pre>{ x: number; y: number }[]</pre> |
| <div id="labelboxes">labelBoxes</div> |  The layout information about the labels of a node or an edge. This information will be used by the [EdgeLabels](../components/edgelabels) component. | <pre>[LabelBox](labelbox)[]</pre> |
| <div id="sourcepoint">sourcePoint</div> |  The coordinates of an edge's source point relative to its source node's center. This information will be used by the [PolylineEdge](../components/polylineedge) to draw the edge path. | <pre>{ x: number; y: number }</pre> |
| <div id="targetpoint">targetPoint</div> |  The coordinates of an edge's target point relative to its target node's center. This information will be used by the [PolylineEdge](../components/polylineedge) to draw the edge path. | <pre>{ x: number; y: number }</pre> |

## EdgeRouterDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter). It allows for defining a function that provide values for each element.

For more information, see [EdgeRouterData](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="ports">ports?</div> |  Provides information about how an edge connects to its nodes. | <pre>[PortDataProvider](portdataprovider)&lt;TEdgeData&gt;</pre> |
| <div id="scope">scope?</div> |  Provides which edges should be routed. | <pre>[EdgeRouterScopeDataProvider](edgerouterscopedataprovider)&lt;<br>  TNodeData,<br>  TEdgeData<br>&gt;</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |

## EdgeRouterOptions


The configuration options for the edge routing algorithm that applies polyline routes to the edges of the graph. <p> For more information on layout algorithm and its available settings, see [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>EdgeRouterEdgeDescriptor</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"consider-unaffected-edge-labels"<br>  &#124; "generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="minimumnodetoedgedistance">minimumNodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"<br>  &#124; "ignore-group-labels"</pre> |
| <div id="rerouting">rerouting?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |

## EdgeRouterScopeDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for scope options in [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter). It allows for defining a function that provide values for each element.

For more information, see [EdgeRouterScopeData](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterScopeData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edges">edges?</div> |  Provides which edges should be routed. | <pre>(<br>  edge: TEdgeData<br>) =&gt; boolean</pre> |
| <div id="incidentnodes">incidentNodes?</div> |  Provides at which nodes edges should be routed. | <pre>(<br>  node: TNodeData<br>) =&gt; boolean</pre> |

## GenericLabelingDataProvider


A provider for individual options per nodes or edges in a [Labeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling). It allows for defining a function that provide values for each element.

For more information, see [LabelingData](https://docs.yworks.com/yfileshtml/#/api/GenericLabelingData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="affectedlabels">affectedLabels?</div> |  Provides which labels should be placed. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; boolean</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |

## GenericLabelingOptions


The configuration options for the labeling algorithm that places the labels of a graph. <p> For more information on the labeling algorithm and its available settings, see [GenericLabeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="defaultedgelabelingcosts">defaultEdgeLabelingCosts?</div> | <pre>LabelingCosts</pre> |
| <div id="defaultnodelabelingcosts">defaultNodeLabelingCosts?</div> | <pre>LabelingCosts</pre> |
| <div id="deterministic">deterministic?</div> | <pre>boolean</pre> |
| <div id="moveinternalnodelabels">moveInternalNodeLabels?</div> | <pre>boolean</pre> |
| <div id="reducelabeloverlaps">reduceLabelOverlaps?</div> | <pre>boolean</pre> |
| <div id="scope">scope?</div> | <pre>"all"<br>  &#124; "edge-labels"<br>  &#124; "node-labels"</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |

## HierarchicalLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout). It allows for defining a function that provide values for each element.

For more information, see [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="edgethickness">edgeThickness?</div> |  Provides a numerical value that represents the thickness of an edge. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margin for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="ports">ports?</div> |  Provides information about how an edge connects to its nodes. | <pre>[PortDataProvider](portdataprovider)&lt;TEdgeData&gt;</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |

## HierarchicalLayoutOptions


The configuration options for the hierarchical layout algorithm that arranges graphs in a hierarchical fashion. <p> For more information on the layout algorithm and its available settings, see [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="automaticedgegrouping">automaticEdgeGrouping?</div> | <pre>boolean</pre> |
| <div id="componentarrangementpolicy">componentArrangementPolicy?</div> | <pre>"compact" &#124; "topmost"</pre> |
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>HierarchicalLayoutEdgeDescriptor</pre> |
| <div id="defaultnodedescriptor">defaultNodeDescriptor?</div> | <pre>HierarchicalLayoutNodeDescriptor</pre> |
| <div id="edgedistance">edgeDistance?</div> | <pre>number</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="fromscratchlayeringstrategy">fromScratchLayeringStrategy?</div> | <pre>"hierarchical-topmost"<br>  &#124; "hierarchical-optimal"<br>  &#124; "hierarchical-tight-tree"<br>  &#124; "hierarchical-downshift"<br>  &#124; "bfs"<br>  &#124; "from-sketch"<br>  &#124; "user-defined"<br>  &#124; "unknown"</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="groupalignmentpolicy">groupAlignmentPolicy?</div> | <pre>"top" &#124; "center" &#124; "bottom"</pre> |
| <div id="grouplayeringpolicy">groupLayeringPolicy?</div> | <pre>"ignore-groups"<br>  &#124; "recursive"<br>  &#124; "recursive-compact"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom"<br>  &#124; "left-to-right"<br>  &#124; "right-to-left"<br>  &#124; "bottom-to-top"</pre> |
| <div id="minimumlayerdistance">minimumLayerDistance?</div> | <pre>number</pre> |
| <div id="nodedistance">nodeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"</pre> |
| <div id="nodetoedgedistance">nodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |

## Insets


Represents the padding for a group node, i.e., a rectangular area inside the group node. If only a number is specified, the padding on all sides are the same.

| Type | | 
|---|---|
|         | <pre>{<br>      top: number<br>      left: number<br>      bottom: number<br>      right: number<br>    }<br>  &#124; number</pre> |

## Label


A label with a text and styling properties.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="classname">className?</div> |  An optional CSS class used for styling the label. | <pre>string</pre> |
| <div id="label">label</div> |  The text of the label. | <pre>string</pre> |
| <div id="labelstyle">labelStyle?</div> |  An optional CSS style used for the label. | <pre>CSSProperties</pre> |

## LabelBox


The layout information of a label.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="angle">angle</div> |  The rotation angle of the label in degrees. Used for checking whether the text has to be flipped and for retrieving the angle information from previous layouts. | <pre>number</pre> |
| <div id="height">height</div> |  The height of the label. | <pre>number</pre> |
| <div id="id">id</div> |  The label id. | <pre>string</pre> |
| <div id="transform">transform</div> |  The CSS transform to be applied on the label element based on the result of the layout algorithm. By default, for edges the transform-origin is set to '0px 0px'. | <pre>string</pre> |
| <div id="width">width</div> |  The width of the label. | <pre>number</pre> |
| <div id="x">x</div> |  The x-coordinate of the label. | <pre>number</pre> |
| <div id="y">y</div> |  The y-coordinate of the label. | <pre>number</pre> |

## LabelData


The properties that describe a label to the layout algorithm.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="data">data</div> |  The label representation in the data. | <pre>string<br>  &#124; [Label](label)<br>  &#124; ReactNode</pre> |
| <div id="labelindex">labelIndex</div> |  The index of the label in the list of labels attached to the same node or edge. | <pre>number</pre> |
| <div id="ownerid">ownerId</div> |  The id of the associated node or edge. | <pre>string</pre> |

## LayoutAlgorithmOptions


All layout configurations supported by [useLayout](../hooks/uselayout).

| Type | | 
|---|---|
|         | <pre>[GenericLabelingOptions](genericlabelingoptions)<br>  &#124; [RadialTreeLayoutOptions](radialtreelayoutoptions)<br>  &#124; [HierarchicalLayoutOptions](hierarchicallayoutoptions)<br>  &#124; [CircularLayoutOptions](circularlayoutoptions)<br>  &#124; [OrganicLayoutOptions](organiclayoutoptions)<br>  &#124; [OrthogonalLayoutOptions](orthogonallayoutoptions)<br>  &#124; [EdgeRouterOptions](edgerouteroptions)<br>  &#124; [RadialLayoutOptions](radiallayoutoptions)<br>  &#124; [TreeLayoutOptions](treelayoutoptions)</pre> |

## LayoutConfiguration&lt;LayoutType, TNodeData, TEdgeData&gt;


The layout configuration is an object consisting of the layout name, and optionally, the layout options for the selected layout algorithm and the layout data provider.

| Type | | 
|---|---|
|         | <pre>LayoutType extends "HierarchicalLayout"<br>  ? {<br>      name: LayoutType<br>      layoutOptions?: [HierarchicalLayoutOptions](hierarchicallayoutoptions)<br>      layoutData?: [HierarchicalLayoutDataProvider](hierarchicallayoutdataprovider)&lt;<br>        TNodeData,<br>        TEdgeData<br>      &gt;<br>    }<br>  : LayoutType extends "OrthogonalLayout"<br>    ? {<br>        name: LayoutType<br>        layoutOptions?: [OrthogonalLayoutOptions](orthogonallayoutoptions)<br>        layoutData?: [OrthogonalLayoutDataProvider](orthogonallayoutdataprovider)&lt;<br>          TNodeData,<br>          TEdgeData<br>        &gt;<br>      }<br>    : LayoutType extends "RadialLayout"<br>      ? {<br>          name: LayoutType<br>          layoutOptions?: [RadialLayoutOptions](radiallayoutoptions)<br>          layoutData?: [RadialLayoutDataProvider](radiallayoutdataprovider)&lt;<br>            TNodeData,<br>            TEdgeData<br>          &gt;<br>        }<br>      : LayoutType extends "CircularLayout"<br>        ? {<br>            name: LayoutType<br>            layoutOptions?: [CircularLayoutOptions](circularlayoutoptions)<br>            layoutData?: [CircularLayoutDataProvider](circularlayoutdataprovider)&lt;<br>              TNodeData,<br>              TEdgeData<br>            &gt;<br>          }<br>        : LayoutType extends "OrganicLayout"<br>          ? {<br>              name: LayoutType<br>              layoutOptions?: [OrganicLayoutOptions](organiclayoutoptions)<br>              layoutData?: [OrganicLayoutDataProvider](organiclayoutdataprovider)&lt;<br>                TNodeData,<br>                TEdgeData<br>              &gt;<br>            }<br>          : LayoutType extends "TreeLayout"<br>            ? {<br>                name: LayoutType<br>                layoutOptions?: [TreeLayoutOptions](treelayoutoptions)<br>                layoutData?: [TreeLayoutDataProvider](treelayoutdataprovider)&lt;<br>                  TNodeData,<br>                  TEdgeData<br>                &gt;<br>              }<br>            : LayoutType extends "RadialTreeLayout"<br>              ? {<br>                  name: LayoutType<br>                  layoutOptions?: [RadialTreeLayoutOptions](radialtreelayoutoptions)<br>                  layoutData?: [RadialTreeLayoutDataProvider](radialtreelayoutdataprovider)&lt;<br>                    TNodeData,<br>                    TEdgeData<br>                  &gt;<br>                }<br>              : LayoutType extends "EdgeRouter"<br>                ? {<br>                    name: LayoutType<br>                    layoutOptions?: [EdgeRouterOptions](edgerouteroptions)<br>                    layoutData?: [EdgeRouterDataProvider](edgerouterdataprovider)&lt;<br>                      TNodeData,<br>                      TEdgeData<br>                    &gt;<br>                  }<br>                : LayoutType extends "GenericLabeling"<br>                  ? {<br>                      name: LayoutType<br>                      layoutOptions?: [GenericLabelingOptions](genericlabelingoptions)<br>                      layoutData?: [GenericLabelingDataProvider](genericlabelingdataprovider)<br>                    }<br>                  : {<br>                      name: LayoutType<br>                      layoutOptions?: undefined<br>                      layoutData?: undefined<br>                    }</pre> |

## LayoutContext


Context information for running a layout algorithm.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="layoutworker">layoutWorker?</div> |  A Web Worker for asynchronous layout calculation. | <pre>Worker</pre> |
| <div id="onerror">onError?</div> |  A callback function invoked when an error occurs during the layout process. It allows developers to handle errors and perform necessary actions when layout errors occur. | <pre>(error: unknown) =&gt; void</pre> |
| <div id="reactflowref">reactFlowRef?</div> |  An optional reference to the React Flow element. This reference is particularly useful in scenarios where there are multiple React Flow elements on the same page or when the flow is encapsulated within a closed shadow DOM. | <pre>RefObject&lt;HTMLDivElement&gt;</pre> |

## LayoutDataProvider&lt;TNodeData, TEdgeData&gt;


All providers for the additional data for layout algorithms supported by [useLayout](../hooks/uselayout).

| Type | | 
|---|---|
|         | <pre>[GenericLabelingDataProvider](genericlabelingdataprovider)<br>  &#124; [RadialTreeLayoutDataProvider](radialtreelayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [HierarchicalLayoutDataProvider](hierarchicallayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [CircularLayoutDataProvider](circularlayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [OrganicLayoutDataProvider](organiclayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [OrthogonalLayoutDataProvider](orthogonallayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [EdgeRouterDataProvider](edgerouterdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [RadialLayoutDataProvider](radiallayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;<br>  &#124; [TreeLayoutDataProvider](treelayoutdataprovider)&lt;<br>      TNodeData,<br>      TEdgeData<br>    &gt;</pre> |

## LayoutName


The names of the layout algorithms [useLayout](../hooks/uselayout) supports.

| Type | | 
|---|---|
|         | <pre>"GenericLabeling"<br>  &#124; "RadialTreeLayout"<br>  &#124; "HierarchicalLayout"<br>  &#124; "CircularLayout"<br>  &#124; "OrganicLayout"<br>  &#124; "OrthogonalLayout"<br>  &#124; "EdgeRouter"<br>  &#124; "RadialLayout"<br>  &#124; "TreeLayout"</pre> |

## LayoutSupport


Contains helper functions to transfer node and edge data to a layout graph and back.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="buildgraph">buildGraph</div> |  Creates a graph from the given data that can be arranged by a yFiles layout algorithm. | <pre>(<br>  nodes: Node_2[],<br>  edges: Edge[],<br>  zoom: number<br>) =&gt; IGraph</pre> |
| <div id="transferlayout">transferLayout</div> |  Transfers the calculated layout from the graph to lists of nodes and edges. | <pre>(graph: IGraph) =&gt; {<br>  arrangedNodes: Node_2[]<br>  arrangedEdges: Edge[]<br>}</pre> |

## NodeData


The data that can be attached to a node in the graph. This type extends the node data with layout-specific information.

| Type | | 
|---|---|
|         | <pre>{<br>  labelStyle?: CSSProperties<br>  className?: string<br>  label?: string<br>  yData?: [NodeLayoutData](nodelayoutdata)<br>}</pre> |

## NodeLayoutData


The result of the layout algorithm that provides all the necessary information to place the nodes and their handles, and arrange the labels. This information will be stored in the `data.yData` of each node.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="labelboxes">labelBoxes</div> |  The layout information about the labels of a node or an edge. This information will be used by the [NodeLabel](../components/nodelabel) component. | <pre>[LabelBox](labelbox)[]</pre> |
| <div id="sourcehandles">sourceHandles</div> |  The id, the location, and the side of the handle on the source node of the edge. This information will be used by the [MultiHandleNode](../components/multihandlenode) to arrange the node handles. | <pre>{<br>  id: string<br>  location: { x: number; y: number }<br>  position: Position<br>}[]</pre> |
| <div id="targethandles">targetHandles</div> |  The id, the location, and the side of the handle on the target node of the edge. This information will be used by the [MultiHandleNode](../components/multihandlenode) to arrange the node handles. | <pre>{<br>  id: string<br>  location: { x: number; y: number }<br>  position: Position<br>}[]</pre> |

## NodeMargins


Represents margins for nodes, i.e., a rectangular area around each node in which no other graph elements can be placed during the layout. If only a number is specified, the margins extend the same on all sides.

| Type | | 
|---|---|
|         | <pre>{<br>      top: number<br>      left: number<br>      bottom: number<br>      right: number<br>    }<br>  &#124; number</pre> |

## OrganicLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). It allows for defining a function that provide values for each element.

For more information, see [OrganicLayoutData](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="minimumedgelengths">minimumEdgeLengths?</div> |  Provides the minimal length that an edge should have. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="minimumnodedistances">minimumNodeDistances?</div> |  Provides the minimal distance from a node to all other nodes. | <pre>(node: TNodeData) =&gt; number</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="preferrededgelengths">preferredEdgeLengths?</div> |  Provides the preferred length for an edge. It is not mandatory but works as a guidance length. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="scope">scope?</div> |  Provides which nodes should be placed. | <pre>[OrganicScopeDataProvider](organicscopedataprovider)&lt;TNodeData&gt;</pre> |

## OrganicLayoutOptions


The configuration options for the organic layout algorithm that arranges graphs in an organic fashion. <p> For more information on the layout algorithm and its available settings, see [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="allowclusterasgroupsubstructure">allowClusterAsGroupSubstructure?</div> | <pre>boolean</pre> |
| <div id="allownodeoverlaps">allowNodeOverlaps?</div> | <pre>boolean</pre> |
| <div id="automaticgroupnodecompaction">automaticGroupNodeCompaction?</div> | <pre>boolean</pre> |
| <div id="avoidnodeedgeoverlap">avoidNodeEdgeOverlap?</div> | <pre>boolean</pre> |
| <div id="chainrecognition">chainRecognition?</div> | <pre>boolean</pre> |
| <div id="chainsubstructuresize">chainSubstructureSize?</div> | <pre>number</pre> |
| <div id="chainsubstructurestyle">chainSubstructureStyle?</div> | <pre>"none"<br>  &#124; "rectangular"<br>  &#124; "rectangular-nested"<br>  &#124; "straight-line"<br>  &#124; "straight-line-nested"<br>  &#124; "disk"<br>  &#124; "disk-nested"</pre> |
| <div id="circlerecognition">circleRecognition?</div> | <pre>boolean</pre> |
| <div id="clusteringpolicy">clusteringPolicy?</div> | <pre>"none"<br>  &#124; "louvain-modularity"<br>  &#124; "edge-betweenness"<br>  &#124; "label-propagation"<br>  &#124; "user-defined"</pre> |
| <div id="compactnessfactor">compactnessFactor?</div> | <pre>number</pre> |
| <div id="cyclesubstructuresize">cycleSubstructureSize?</div> | <pre>number</pre> |
| <div id="cyclesubstructurestyle">cycleSubstructureStyle?</div> | <pre>"none"<br>  &#124; "circular"<br>  &#124; "circular-nested"</pre> |
| <div id="defaultminimumnodedistance">defaultMinimumNodeDistance?</div> | <pre>number</pre> |
| <div id="defaultpreferrededgelength">defaultPreferredEdgeLength?</div> | <pre>number</pre> |
| <div id="deterministic">deterministic?</div> | <pre>boolean</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="groupnodecompactness">groupNodeCompactness?</div> | <pre>number</pre> |
| <div id="groupsubstructurescope">groupSubstructureScope?</div> | <pre>"no-groups"<br>  &#124; "groups-without-edges"<br>  &#124; "groups-without-inter-edges"<br>  &#124; "all-groups"</pre> |
| <div id="groupsubstructuresize">groupSubstructureSize?</div> | <pre>number</pre> |
| <div id="groupsubstructurestyle">groupSubstructureStyle?</div> | <pre>"circle"<br>  &#124; "compact-disk"<br>  &#124; "disk"<br>  &#124; "organic-disk"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom"<br>  &#124; "left-to-right"<br>  &#124; "right-to-left"<br>  &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"</pre> |
| <div id="parallelsubstructuresize">parallelSubstructureSize?</div> | <pre>number</pre> |
| <div id="parallelsubstructurestyle">parallelSubstructureStyle?</div> | <pre>"none"<br>  &#124; "rectangular"<br>  &#124; "radial"<br>  &#124; "straight-line"</pre> |
| <div id="parallelsubstructuretypeseparation">parallelSubstructureTypeSeparation?</div> | <pre>boolean</pre> |
| <div id="preferredminimumnodetoedgedistance">preferredMinimumNodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="qualitytimeratio">qualityTimeRatio?</div> | <pre>number</pre> |
| <div id="starsubstructuresize">starSubstructureSize?</div> | <pre>number</pre> |
| <div id="starsubstructurestyle">starSubstructureStyle?</div> | <pre>"none"<br>  &#124; "radial"<br>  &#124; "radial-nested"<br>  &#124; "separated-radial"<br>  &#124; "circular"<br>  &#124; "circular-nested"</pre> |
| <div id="starsubstructuretypeseparation">starSubstructureTypeSeparation?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |
| <div id="treesubstructuresize">treeSubstructureSize?</div> | <pre>number</pre> |
| <div id="treesubstructurestyle">treeSubstructureStyle?</div> | <pre>"none"<br>  &#124; "oriented"<br>  &#124; "radial"<br>  &#124; "radial-tree"</pre> |

## OrganicScopeDataProvider&lt;TNodeData&gt;


A provider for scope options in [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). It allows for defining a function that provide values for each element.

For more information, see [OrganicScopeData](https://docs.yworks.com/yfileshtml/#/api/OrganicScopeData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="groupnodehandlingpolicies">groupNodeHandlingPolicies?</div> |  Provides how group nodes are handled. | <pre>(<br>  node: TNodeData<br>) =&gt;<br>  &#124; "fix-bounds"<br>  &#124; "fix-contents"<br>  &#124; "free"</pre> |
| <div id="nodes">nodes?</div> |  Provides which nodes should be placed. | <pre>(<br>  node: TNodeData<br>) =&gt; boolean</pre> |
| <div id="scopemodes">scopeModes?</div> |  Provides when to place a node. | <pre>(<br>  node: TNodeData<br>) =&gt;<br>  &#124; "affected"<br>  &#124; "fixed"<br>  &#124; "include-close-nodes"<br>  &#124; "include-extended-neighborhood"</pre> |

## OrthogonalLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [OrthogonalLayout](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout). It allows for defining a function that provide values for each element.

For more information, see [OrthogonalLayoutData](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |

## OrthogonalLayoutOptions


The configuration options for the Orthogonal layout algorithm that arranges graphs in an orthogonal fashion. <p> For more information on the layout algorithm and its available settings, see [OrthogonalLayout](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="aligndegreeonenodes">alignDegreeOneNodes?</div> | <pre>boolean</pre> |
| <div id="chainsubstructuresize">chainSubstructureSize?</div> | <pre>number</pre> |
| <div id="chainsubstructurestyle">chainSubstructureStyle?</div> | <pre>"none"<br>  &#124; "straight"<br>  &#124; "wrapped-with-nodes-at-turns"<br>  &#124; "wrapped-with-bends-at-turns"</pre> |
| <div id="cyclesubstructuresize">cycleSubstructureSize?</div> | <pre>number</pre> |
| <div id="cyclesubstructurestyle">cycleSubstructureStyle?</div> | <pre>"none"<br>  &#124; "circular"<br>  &#124; "circular-with-nodes-at-corners"<br>  &#124; "circular-with-bends-at-corners"</pre> |
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>OrthogonalLayoutEdgeDescriptor</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom"<br>  &#124; "left-to-right"<br>  &#124; "right-to-left"<br>  &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"</pre> |
| <div id="preferparallelroutes">preferParallelRoutes?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |
| <div id="treesubstructureorientation">treeSubstructureOrientation?</div> | <pre>"top-to-bottom"<br>  &#124; "bottom-to-top"<br>  &#124; "left-to-right"<br>  &#124; "right-to-left"<br>  &#124; "auto-detect"</pre> |
| <div id="treesubstructuresize">treeSubstructureSize?</div> | <pre>number</pre> |
| <div id="treesubstructurestyle">treeSubstructureStyle?</div> | <pre>"none"<br>  &#124; "default"<br>  &#124; "integrated"<br>  &#124; "compact"<br>  &#124; "aspect-ratio"</pre> |
| <div id="uniformportassignment">uniformPortAssignment?</div> | <pre>boolean</pre> |

## PolylinePathProps


Parameters that describe a polyline edge path.

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="bends">bends</div> |  The coordinates of the bends. | <pre>{ x: number; y: number }[]</pre> |
| <div id="sourcex">sourceX</div> |  The x-coordinate of the source point of the edge. | <pre>number</pre> |
| <div id="sourcey">sourceY</div> |  The y-coordinate of the source point of the edge. | <pre>number</pre> |
| <div id="targetx">targetX</div> |  The x-coordinate of the target point of the edge. | <pre>number</pre> |
| <div id="targety">targetY</div> |  The y-coordinate of the target point of the edge. | <pre>number</pre> |

## PortDataProvider&lt;TEdgeData&gt;


A provider for port data.

For more information, see [PortData](https://docs.yworks.com/yfileshtml/#/api/PortData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="sourceportalignmentids">sourcePortAlignmentIds?</div> |  Provides ids to align the source ports of edges at the same node. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="sourceportcandidates">sourcePortCandidates?</div> |  Provides the sides of a node at which the edge should start. | <pre>(<br>  edge: TEdgeData<br>) =&gt; [PortSides](portsides)[]</pre> |
| <div id="sourceportgroupids">sourcePortGroupIds?</div> |  Provides ids to group edges at their source. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetportalignmentids">targetPortAlignmentIds?</div> |  Provides ids to align the target ports of edges at the same node. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetportcandidates">targetPortCandidates?</div> |  Provides the sides of a node at which the edge should end. | <pre>(<br>  edge: TEdgeData<br>) =&gt; [PortSides](portsides)[]</pre> |
| <div id="targetportgroupids">targetPortGroupIds?</div> |  Provides ids to group edges at their target. | <pre>(edge: TEdgeData) =&gt; any</pre> |

## PortSides


The port sides supported by layout data providers in [useLayout](../hooks/uselayout).

| Type | | 
|---|---|
|         | <pre>"end-in-flow"<br>  &#124; "any"<br>  &#124; "right"<br>  &#124; "left-in-flow"<br>  &#124; "top"<br>  &#124; "right-in-flow"<br>  &#124; "bottom"<br>  &#124; "left"<br>  &#124; "start-in-flow"</pre> |

## RadialLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [RadialLayout](https://docs.yworks.com/yfileshtml/#/api/RadialLayout). It allows for defining a function that provide values for each element.

For more information, see [RadialLayoutData](https://docs.yworks.com/yfileshtml/#/api/RadialLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="centernodes">centerNodes?</div> |  Provides which nodes should be placed on the innermost circle. | <pre>(<br>  node: TNodeData<br>) =&gt; boolean</pre> |
| <div id="childorder">childOrder?</div> |  Provides an order for outgoing edges at the given node in which the edges are arranged. | <pre>[ChildOrderDataProvider](childorderdataprovider)&lt;<br>  TNodeData,<br>  TEdgeData<br>&gt;</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## RadialLayoutOptions


The configuration options for the radial layout algorithm that arranges graphs in a radial fashion. <p> For more information on the layout algorithm and its available settings, see [RadialLayout](https://docs.yworks.com/yfileshtml/#/api/RadialLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="centernodespolicy">centerNodesPolicy?</div> | <pre>"directed"<br>  &#124; "centrality"<br>  &#124; "weighted-centrality"</pre> |
| <div id="createcontrolpoints">createControlPoints?</div> | <pre>boolean</pre> |
| <div id="edgeroutingstyle">edgeRoutingStyle?</div> | <pre>"polyline"<br>  &#124; "arc"<br>  &#124; "radial-polyline"<br>  &#124; "curved"</pre> |
| <div id="layeringstrategy">layeringStrategy?</div> | <pre>"bfs"<br>  &#124; "hierarchical"<br>  &#124; "dendrogram"</pre> |
| <div id="layerspacing">layerSpacing?</div> | <pre>number</pre> |
| <div id="maximumchildsectorangle">maximumChildSectorAngle?</div> | <pre>number</pre> |
| <div id="minimumbendangle">minimumBendAngle?</div> | <pre>number</pre> |
| <div id="minimumedgedistance">minimumEdgeDistance?</div> | <pre>number</pre> |
| <div id="minimumlayerdistance">minimumLayerDistance?</div> | <pre>number</pre> |
| <div id="minimumnodedistance">minimumNodeDistance?</div> | <pre>number</pre> |
| <div id="minimumsectordistance">minimumSectorDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "horizontal"<br>  &#124; "ignore"<br>  &#124; "ray-like"<br>  &#124; "ray-like-leaves"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |

## RadialTreeLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [RadialTreeLayoutLayout](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout). It allows for defining a function that provide values for each element.

For more information, see [RadialTreeLayoutData](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="childorder">childOrder?</div> |  Provides an order for the given edges in which the edges are arranged at a node. | <pre>[ChildOrderDataProvider](childorderdataprovider)&lt;<br>  TNodeData,<br>  TEdgeData<br>&gt;</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## RadialTreeLayoutOptions


The configuration options for the radial tree layout algorithm that arranges the subtrees of the tree graph in a radial fashion. <p> For more information on the layout algorithm and its available settings, see [RadialTreeLayout](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="allowoverlaps">allowOverlaps?</div> | <pre>boolean</pre> |
| <div id="chainstraighteningmode">chainStraighteningMode?</div> | <pre>boolean</pre> |
| <div id="childalignmentpolicy">childAlignmentPolicy?</div> | <pre>"plain"<br>  &#124; "same-center"<br>  &#124; "compact"<br>  &#124; "smart"</pre> |
| <div id="childorderingpolicy">childOrderingPolicy?</div> | <pre>"compact"<br>  &#124; "symmetric"<br>  &#124; "from-sketch"</pre> |
| <div id="compactnessfactor">compactnessFactor?</div> | <pre>number</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="edgelabelspacing">edgeLabelSpacing?</div> | <pre>number</pre> |
| <div id="minimumedgelength">minimumEdgeLength?</div> | <pre>number</pre> |
| <div id="minimumnodedistance">minimumNodeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "horizontal"<br>  &#124; "ignore"<br>  &#124; "ray-like"<br>  &#124; "ray-like-leaves"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |
| <div id="preferredchildsectorangle">preferredChildSectorAngle?</div> | <pre>number</pre> |
| <div id="preferredrootsectorangle">preferredRootSectorAngle?</div> | <pre>number</pre> |
| <div id="rootselectionpolicy">rootSelectionPolicy?</div> | <pre>"directed-root"<br>  &#124; "center-root"<br>  &#124; "weighted-center-root"</pre> |

## TreeLayoutDataProvider&lt;TNodeData, TEdgeData&gt;


A provider for individual options per nodes or edges in a [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). It allows for defining a function that provide values for each element.

For more information, see [TreeLayoutData](https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData).

### Props
    
| Name | Description | Type |
|---|---|---|
| <div id="assistantnodes">assistantNodes?</div> |  Provides which nodes should be placed separately from their siblings. | <pre>(<br>  node: TNodeData<br>) =&gt; boolean</pre> |
| <div id="childorder">childOrder?</div> |  Provides an order for outgoing edges at the given node in which the edges are arranged. | <pre>[ChildOrderDataProvider](childorderdataprovider)&lt;<br>  TNodeData,<br>  TEdgeData<br>&gt;</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(<br>  label: [LabelData](labeldata)<br>) =&gt; [EdgeLabelPreferredPlacement](edgelabelpreferredplacement)</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(<br>  node: TNodeData<br>) =&gt; [Insets](insets)</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(<br>  node: TNodeData<br>) =&gt; [NodeMargins](nodemargins)</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## TreeLayoutOptions


The configuration options for the tree layout algorithm that arranges graphs with a tree structure. <p> For more information on the layout algorithm and its available settings, see [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). </p>

### Props
    
| Name | Type |
|---|---|
| <div id="allowmultiparent">allowMultiParent?</div> | <pre>boolean</pre> |
| <div id="defaultsubtreeplacer">defaultSubtreePlacer?</div> | <pre>ISubtreePlacer</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic"<br>  &#124; "ignore"<br>  &#124; "integrated"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom"<br>  &#124; "left-to-right"<br>  &#124; "right-to-left"<br>  &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider"<br>  &#124; "generic"<br>  &#124; "ignore"</pre> |

## getPolylinePath()


The function `getPolylinePath` returns everything you need to render a polyline edge between two nodes.
 ```tsx
 export function CustomEdge(props: EdgeProps) {
   const [edgePath] = getPolylinePath({
     sourceX: props.sourceX,
     sourceY: props.sourceY,
     targetX: props.targetX,
     targetY: props.targetY,
     bends: props.data?.yData?.bends ?? []
   })

   return ( <BaseEdge path={edgePath} {...props} /> )
 }
 ```





      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="params">params</div> | The coordinates of the source point, the target point, and the bends. | <pre>[PolylinePathProps](../types/polylinepathprops)</pre>
      
### Returns
| Type | Description | 
|---|---|
| <pre>[<br>  path: string,<br>  labelX: number,<br>  labelY: number,<br>  offsetX: number,<br>  offsetY: number<br>]</pre> | Returns an array that contains the edge path, the center location of the edge, e.g. to place a label, and the relative center location of the edge. |

## initializeWebWorker()


Initializes a Web Worker for the layout calculation.

For example, this function can be used in a Web Worker for asynchronous layout calculation.
 ```tsx
 // LayoutWorker.ts
 import { initializeWebWorker } from '@yworks/yfiles-layout-reactflow/WebWorkerSupport'
 initializeWebWorker(self)
 ```
```tsx
 // index.tsx
 const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
   type: 'module'
 })

 const LayoutFlow = () => {
   const [nodes] = useNodesState(initialNodes)
   const [edges] = useEdgesState(initialEdges)

   const { runLayout } = useLayout({ layoutWorker })

   return (
     <ReactFlow>
       <Panel position="top-left">
         <button onClick={() => runLayout('HierarchicalLayout')}>Layout</button>
       </Panel>
     </ReactFlow>
   )
 }

 export default function Flow() {
   return (
     <ReactFlowProvider>
       <LayoutFlow />
     </ReactFlowProvider>
   )
 }
 ```



      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="self">self</div> | The current worker | <pre>Window</pre>

## registerLicense()


Registers the [yFiles license](http://docs.yworks.com/yfileshtml/#/dguide/licensing) which is needed to use the [useLayout](../hooks/uselayout) hook or the [useLayoutSupport](../hooks/uselayoutsupport) hook which are based on [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html).
 ```tsx
 function App() {
   registerLicense(yFilesLicense)

   const { runLayout } = useLayout()

   return (
     <ReactFlow></ReactFlow>
   )
 }
 ```



      
### Parameters
| Name | Description | Type |
|---|---|---|
| <div id="licensekey">licenseKey</div> | The license key to register | <pre>Record&lt;string, unknown&gt;</pre>