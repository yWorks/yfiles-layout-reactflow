## Custom Element Types

Incorporating layout algorithms into your React Flow application is essential for organizing nodes and edges effectively.
These algorithms ensure that edges connect at various points on node borders, providing a comprehensive representation
of your data flow. Additionally, they can arrange labels for both nodes and edges to enhance clarity.

## Integrating the Custom Types

If your flow utilizes default node and edge types, seamlessly integrate our custom components as new defaults.

```tsx
import { MultiHandleNode, PolylineEdge } from '@yworks/yfiles-layout-reactflow'

const edgeTypes = {
  default: PolylineEdge
}

const nodeTypes = {
  default: MultiHandleNode
}
```

For already customized nodes, you can wrap them with the `withMultiHandles` higher-order component (HOC) to enable
placement of labels and multiple handles, enhancing their flexibility.

```tsx
import { withMultiHandles } from '@yworks/yfiles-layout-reactflow'
import CustomNode from './CustomNode'

const nodeTypes = {
  custom: withMultiHandles(CustomNode)
}
```

Customized edges can be adjusted using the `getPolylinePath` function. It integrates similarly to React Flow functions
like [getBezierPath](https://reactflow.dev/api-reference/utils/get-bezier-path), allowing it to replace these functions
to support polyline edges.

```tsx
import { BaseEdge, EdgeProps } from '@xyflow/react'
import { getPolylinePath } from '@yworks/yfiles-layout-reactflow'

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

Once you have prepared your graph, you can [run a layout algorithm](customizinglayouts) on it.


## Customizing Layouts

Configuring layout algorithms in your React Flow project provides a powerful way to organize and display data visually.
You can efficiently integrate layout algorithms into your application and customize them according to your requirements.

> **Note:** To effectively visualize the outcome of the layout algorithm, it is essential to use
  [Node and Edge types](customelementtypes) that are capable of accommodating multiple handles and polyline paths.

The `useLayout` hook serves as the entry point for integrating yFiles layout algorithms into your React Flow components.
It provides a callback to invoke the layout algorithm when needed.

When configuring the layout, the fundamental requirement is specifying the layout name. Optionally, you can further
refine the layout by providing additional properties, such as routing styles, and defining mappings for individual
elements, such as port candidates.

The layout is automatically executed and applied to the current node and edge data within the flow.

For scenarios where the layout computation is resource-intensive or time-consuming, you can leverage asynchronous layout
computation using web workers. By offloading the computation to a separate thread, you ensure that the main UI thread
remains responsive.\
To enable asynchronous layout calculation, instantiate a web worker that invokes [initializeWebWorker](../functions/initializewebworker), then pass this
worker to the `useLayout` hook.

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutConfiguration: LayoutConfiguration =
  {
    name: 'HierarchicalLayout',
    layoutOptions: {
      minimumLayerDistance: 50,
      edgeLabelPlacement: 'integrated'
    },
    layoutData: {
      sourceGroupIds: (edge) =>
        edge.source,
      groupNodePadding: () => 50
    }
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  // call the useLayout-hook to get the function that invokes the layout
  const { runLayout } = useLayout();

  // run initial layout after the nodes have been measured
  useNodesMeasuredEffect(() => {
    // run the hierarchical layout with a given configuration
    // play around with the options and observe how the layout changes
    runLayout(layoutConfiguration);
  });

  // a React Flow with a button that triggers the layout calculation
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <Panel position="top-left">
        <button
          onClick={() =>
            runLayout(
              layoutConfiguration
            )
          }
        >
          Run Layout
        </button>
      </Panel>
    </ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Labeling

*yFiles Layout Algorithms for React Flow* includes support for labeling algorithms, enabling users to place labels
on nodes and edges. Labels can be placed either by selecting a layout algorithm that automatically reserves
space for the node/edge labels and places them there (e.g., [HierarchicalLayout](../layouts/hierarchicallayout),
[OrganicLayout](../layouts/organiclayout)), or by applying the [GenericLabeling](../layouts/genericlabeling)
algorithm directly.

```tsx
const { runLayout } = useLayout()

useEffect(() => {
  runLayout({
    name: 'HierarchicalLayout',
    layoutOptions: {
      edgeLabelPlacement: 'integrated',
      nodeLabelPlacement: 'consider'
    }
  })
}, runLayout)

useEffect(() => {
  runLayout({
    name: 'GenericLabeling',
    layoutOptions: { scope: 'edge-labels' },
  })
}, runLayout)
```

Node labels can be placed either in the interior or the exterior of the nodes with the option for rotation depending on the
configuration of the applied layout algorithm.
Edges can have multiple labels and edge label placement information can be conveyed to the layout/labeling algorithm through a
`EdgeLabelPreferredPlacement`, which is passed via the layout data provider.

```tsx
const { runLayout } = useLayout()

useEffect(() => {
  runLayout({
    name: 'HierarchicalLayout',
    layoutOptions: {
      edgeLabelPlacement: 'integrated',
      nodeLabelPlacement: 'consider'
    },
    layoutData: {
      edgeLabelPreferredPlacements: labelPreferredPlacement
    }
  })
}, runLayout)

const labelPreferredPlacement = useMemo(
  () =>
    (label: LabelData): EdgeLabelPreferredPlacement => {
      if (label.labelIndex === 1) {
        return {
          sideOfEdge: 'left-of-edge',
          distanceToEdge: 20,
          placementAlongEdge: 'at-source',
          angleReference: 'relative-to-edge-flow'
        }
      }
      return {
        sideOfEdge: 'on-edge',
        placementAlongEdge: 'at-center'
      }
    },
  []
)
```

When using the [MultiHandleNode](../components/multihandlenode) and
the [PolylineEdge](../components/polylineedge), the label arrangement is supported out-of-the-box.
However, if other custom element types are created that do not wrap the ones mentioned above, the [NodeLabel](../components/nodelabel)
and [EdgeLabels](../components/edgelabels) components have to be employed. These components support
the custom placement and rotation of labels after applying a layout/labeling algorithm. In both scenarios,
layout information about a label after applying a layout algorithm can be retrieved from `data.yData.labelBoxes`.

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

// the layout configuration for the organic layout algorithm
const layoutConfiguration: LayoutConfiguration =
  {
    name: 'OrganicLayout',
    layoutOptions: {
      // enable edge labeling
      edgeLabelPlacement: 'integrated',
      // enable node labeling
      nodeLabelPlacement: 'consider',
      deterministic: true,
      defaultPreferredEdgeLength: 40
    },
    layoutData: {
      edgeLabelPreferredPlacements:
        () => ({
          edgeSide: 'on-edge',
          placementAlongEdge:
            'at-source',
          angleReference:
            'relative-to-edge-flow'
        })
    }
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  // call the useLayout-hook to get the function that invokes the layout
  const { runLayout } = useLayout();

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout(layoutConfiguration);
  });

  // a React Flow with a button that triggers the layout calculation
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <Panel position="top-left">
        <button
          onClick={() =>
            runLayout(
              layoutConfiguration
            )
          }
        >
          Run Layout
        </button>
      </Panel>
    </ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Circular Layout

The *circular layout algorithm* is designed to arrange nodes in a circular fashion, providing a clear visual representation
of relationships within the graph.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/circular-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Circlar layout"></img>
</div>

The circular layout algorithm provides extensive customization options through a wide array of properties accessible
via the `CircularLayoutOptions`. Fundamental options include various layout styles including separate graph partitions,
several edge routing styles for internal and external edges, and others.
It also automatically places node and edge labels when the corresponding properties are activated. Node labels can also be
placed in a ray-like manner.

Additional customization for individual graph elements, such as `nodeTypes`, `nodeMargins`, and more, can be achieved via
the `CircularLayoutDataProvider`.

Feel free to play around with the circular layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the circular layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/CircularLayout).

```tsx
runLayout({
  name: 'CircularLayout',
  layoutOptions: {
    nodeLabelPlacement: 'ray-like-leaves',
  },
  layoutData: {
    nodeMargins: () => 10
  }
})
```

## CircularLayoutOptions

The configuration options for the circular layout algorithm that arranges graphs in a circular fashion. <p> For more information on the layout algorithm and its available settings, see [CircularLayout](https://docs.yworks.com/yfileshtml/#/api/CircularLayout). </p>

| Name | Type |
|---|---|
| <div id="edgedescriptor">edgeDescriptor?</div> | <pre>CircularLayoutEdgeDescriptor</pre> |
| <div id="edgeroutingpolicy">edgeRoutingPolicy?</div> | <pre>"interior" &#124; "automatic" &#124; "exterior"</pre> |
| <div id="exterioredgedescriptor">exteriorEdgeDescriptor?</div> | <pre>CircularLayoutExteriorEdgeDescriptor</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="maximumdeviationangle">maximumDeviationAngle?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore" &#124; "ray-like" &#124; "ray-like-leaves" &#124; "horizontal"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |
| <div id="partitiondescriptor">partitionDescriptor?</div> | <pre>PartitionDescriptor</pre> |
| <div id="partitioningpolicy">partitioningPolicy?</div> | <pre>"bcc-compact" &#124; "bcc-isolated" &#124; "single-cycle"</pre> |
| <div id="placechildrenoncommonradius">placeChildrenOnCommonRadius?</div> | <pre>boolean</pre> |
| <div id="starsubstructuresize">starSubstructureSize?</div> | <pre>number</pre> |
| <div id="starsubstructurestyle">starSubstructureStyle?</div> | <pre>"none" &#124; "radial" &#124; "separated-radial"</pre> |
| <div id="starsubstructuretypeseparation">starSubstructureTypeSeparation?</div> | <pre>boolean</pre> |


## CircularLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [CircularLayout](https://docs.yworks.com/yfileshtml/#/api/CircularLayout).
It allows for defining a function that provide values for each element.

For more information, see [CircularLayoutData](https://docs.yworks.com/yfileshtml/#/api/CircularLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: CircularLayoutOptions =
  {
    nodeLabelPlacement:
      'ray-like-leaves'
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'CircularLayout',
      layoutOptions
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Edge Router

The *edge router algorithm* applies polyline routes to the edges of the graph. Edges are by default routed in an orthogonal fashion,
i.e., they only consist of horizontal and vertical segments. The edge router algorithm does not affect the node placement.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/edgerouter.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Edge router"></img>
</div>

The edge router algorithm provides customization options through a wide array of properties accessible
via the `EdgeRouterOptions`. The edge router can be applied on the whole graph set or only on a set of selected edges.
It also automatically places node and edge labels when the corresponding properties are activated.

Additional customization for individual graph elements, such as `sourcePortCandidates`, `nodeMargins`, and more, can be achieved via
the `EdgeRouterDataProvider`.

Feel free to play around with the orthogonal layout configuration in our [online playground](edgerouter#playground).

Extensive documentation detailing all available properties of the orthogonal layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter).


```tsx
runLayout({
  name: 'EdgeRouter',
  layoutOptions: {
    defaultEdgeDescriptor: { routingStyle: 'octilinear'},
    edgeLabelPlacement: 'integrated'
  },
  layoutData: {
    ports: {
      sourcePortCandidates: (edge: EdgeProps) =>
        parseInt(edge.target) % 2 === 0 ? ['right'] : ['left'],
    },
    nodeMargins: () => 20
  }
})
```

## EdgeRouterOptions

The configuration options for the edge routing algorithm that applies polyline routes to the edges of the graph. <p> For more information on layout algorithm and its available settings, see [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter). </p>

| Name | Type |
|---|---|
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>EdgeRouterEdgeDescriptor</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"consider-unaffected-edge-labels" &#124; "generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="minimumnodetoedgedistance">minimumNodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore" &#124; "ignore-group-labels"</pre> |
| <div id="rerouting">rerouting?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |

## EdgeRouterDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter). It allows for defining a function that provide values for each element.

For more information, see [EdgeRouterData](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData).

| Name | Description | Type |
|---|---|---|
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="ports">ports?</div> |  Provides information about how an edge connects to its nodes. | <pre>**PortDataProvider**&lt;TEdgeData&gt;</pre> |
| <div id="scope">scope?</div> |  Provides which edges should be routed. | <pre>**EdgeRouterScopeDataProvider**&lt;TNodeData,TEdgeData&gt;</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: EdgeRouterOptions =
  {
    minimumNodeToEdgeDistance: 20
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  // call the useLayout-hook to get the function that invokes the layout
  const { runLayout } = useLayout();

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({
      name: 'EdgeRouter',
      layoutOptions
    });
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.1}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Generic Labeling

The *generic labeling algorithm* places the nodes and edge labels of a graph such that they,
ideally, do not overlap with each other or with graph elements. The algorithm does not affect the node
positions and the edge routes. It can also support rotated labels.

Node labels can be placed either in the interior or the exterior of the nodes with the option for rotation.
The information about edge label placement can be conveyed to the labeling algorithm through a
`EdgeLabelPreferredPlacement`.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/generic-labeling.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Generic labeling"></img>
</div>

The generic labeling algorithm provides extensive customization options through a wide array of properties accessible
via the `GenericLabelingOptions`. It can be applied on the whole graph or only on a predefined set of nodes and edges.

Additional customization for individual graph elements, such as `edgeLabelPreferredPlacements`, `affectedLabels`, and more, can be achieved via
the `GenericLabelingDataProvider`.

Feel free to play around with the orthogonal layout configuration in our [online playground](genericlabeling#playground).

Extensive documentation detailing all available properties of the radial tree layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/LabelingLayout).

```tsx
runLayout({
  name: 'GenericLabeling',
  layoutOptions: { scope: 'all' },
  layoutData: {
    edgeLabelPreferredPlacements: () => ({
      sideOfEdge: 'left-of-edge',
      distanceToEdge: 20,
    })
  }
})
```


## GenericLabelingOptions

The configuration options for the labeling algorithm that places the labels of a graph. <p> For more information on the labeling algorithm and its available settings, see [GenericLabeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling). </p>


| Name | Type |
|---|---|
| <div id="defaultedgelabelingcosts">defaultEdgeLabelingCosts?</div> | <pre>LabelingCosts</pre> |
| <div id="defaultnodelabelingcosts">defaultNodeLabelingCosts?</div> | <pre>LabelingCosts</pre> |
| <div id="deterministic">deterministic?</div> | <pre>boolean</pre> |
| <div id="moveinternalnodelabels">moveInternalNodeLabels?</div> | <pre>boolean</pre> |
| <div id="reducelabeloverlaps">reduceLabelOverlaps?</div> | <pre>boolean</pre> |
| <div id="scope">scope?</div> | <pre>"all" &#124; "edge-labels" &#124; "node-labels"</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |


## GenericLabelingDataProvider

A provider for individual options per nodes or edges in a [Labeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling). It allows for defining a function that provide values for each element.

For more information, see [LabelingData](https://docs.yworks.com/yfileshtml/#/api/LabelingData).

| Name | Description | Type |
|---|---|---|
| <div id="affectedlabels">affectedLabels?</div> |  Provides which labels should be placed. | <pre>(label: **LabelData**) =&gt; boolean</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |

## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: GenericLabelingOptions =
  {
    scope: 'all'
  };

const layoutData: GenericLabelingDataProvider =
  {
    edgeLabelPreferredPlacements:
      () => ({
        edgeSide: 'on-edge',
        placementAlongEdge: 'at-center'
      })
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  // call the useLayout-hook to get the function that invokes the layout
  const { runLayout } = useLayout();

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({
      name: 'GenericLabeling',
      layoutOptions,
      layoutData
    });
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.000000000001}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Hierarchical Layout

The *hierarchical layout algorithm* arranges graphs in a hierarchical fashion. It aims to highlight the main direction
or flow within a directed graph. The nodes of a graph are placed in hierarchically arranged layers such that 
the (majority of) edges of the graph show the same overall orientation, for example, top-to-bottom. Additionally, 
the ordering of the nodes within each layer is chosen in such a way that the number of edge crossings is small.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/hierarchic-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Hierarchical layout with groups"></img>
</div>

The hierarchical layout algorithm offers extensive customization options through a wide array of properties accessible
via `HierarchicalLayoutOptions`. Fundamental options include layout orientation, orthogonal edge routing, layer distance, and others.
Moreover, the hierarchical layout supports grouped graphs. It also automatically places node and edge labels when the
corresponding properties are activated.

Additional customization for individual graph elements, such as `sourcePortCandidates`, `nodeMargins`, and more, can be achieved via
the `HierarchicalLayoutDataProvider`.

Feel free to play around with the hierarchical layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the hierarchical layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout#hierarchical_layout).

```tsx
runLayout({
  name: 'HierarchicalLayout',
  layoutOptions: {
    minimumLayerDistance: 60,
    edgeLabelPlacement: 'integrated',
    nodeLabelPlacement: 'consider'
  },
  layoutData: {
    ports: {
      sourcePortCandidates: (edge: EdgeProps) =>
        parseInt(edge.target) % 2 === 0 ? ['right'] : ['left']
      }
    }
})
```

## HierarchicalLayoutOptions

The configuration options for the hierarchical layout algorithm that arranges graphs in a hierarchical fashion. <p> For more information on the layout algorithm and its available settings, see [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout).</p>

| Name | Type |
|---|---|
| <div id="automaticedgegrouping">automaticEdgeGrouping?</div> | <pre>boolean</pre> |
| <div id="componentarrangementpolicy">componentArrangementPolicy?</div> | <pre>"compact" &#124; "topmost"</pre> |
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>HierarchicalLayoutEdgeDescriptor</pre> |
| <div id="defaultnodedescriptor">defaultNodeDescriptor?</div> | <pre>HierarchicalLayoutNodeDescriptor</pre> |
| <div id="edgedistance">edgeDistance?</div> | <pre>number</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="fromscratchlayeringstrategy">fromScratchLayeringStrategy?</div> | <pre>"hierarchical-topmost" &#124; "hierarchical-optimal" &#124; "hierarchical-tight-tree" &#124; "hierarchical-downshift" &#124; "bfs" &#124; "from-sketch" &#124; "user-defined" &#124; "unknown"</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="groupalignmentpolicy">groupAlignmentPolicy?</div> | <pre>"top" &#124; "center" &#124; "bottom"</pre> |
| <div id="grouplayeringpolicy">groupLayeringPolicy?</div> | <pre>"ignore-groups" &#124; "recursive" &#124; "recursive-compact"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom" &#124; "left-to-right" &#124; "right-to-left" &#124; "bottom-to-top"</pre> |
| <div id="minimumlayerdistance">minimumLayerDistance?</div> | <pre>number</pre> |
| <div id="nodedistance">nodeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore"</pre> |
| <div id="nodetoedgedistance">nodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |


## HierarchicalLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout).
It allows for defining a function that provides values for each element.

For more information, see [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="edgethickness">edgeThickness?</div> |  Provides a numerical value that represents the thickness of an edge. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margin for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="ports">ports?</div> |  Provides information about how an edge connects to its nodes. | <pre>**PortDataProvider** =&lt;TEdgeData&gt;</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: HierarchicalLayoutOptions =
  {
    minimumLayerDistance: 50,
    edgeLabelPlacement: 'integrated',
    nodeToEdgeDistance: 50
  };

const layoutData: HierarchicalLayoutDataProvider<
  NodeProps,
  EdgeProps
> = {
  groupNodePadding: () => 30
};

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'HierarchicalLayout',
      layoutOptions,
      layoutData
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Organic Layout

The *organic layout algorithm* is designed to arrange nodes in an organic fashion that effectively highlight the
underlying structure of complex graphs.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/organic-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Organic Layout"></img>
</div>

The organic layout algorithm provides extensive customization options through a wide array of properties accessible
via the `OrganicLayoutOptions`. Fundamental options include preferred edge lengths, substructure detection, minimum node distances, and more.
It also automatically places node and edge labels when the corresponding properties are activated.

Additional customization for individual graph elements, such as `edgeLabelPreferredPlacements`, `nodeMargins`, and more, can be achieved via
the `OrganicLayoutDataProvider`.

Feel free to play around with the orthogonal layout configuration in our [online playground](organiclayout#playground).

Extensive documentation detailing all available properties of the organic layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout).

```tsx
runLayout({
  name: 'OrganicLayout',
  layoutOptions: {
    edgeLabelPlacement: 'integrated',
    deterministic: true,
    defaultMinimumNodeDistance: 100
  },
  layoutData: {
    edgeLabelPreferredPlacements: () => ({
      edgeSide: 'left-of-edge',
      distanceToEdge: 20,
    })
  }
})
```


## OrganicLayoutOptions


The configuration options for the organic layout algorithm that arranges graphs in an organic fashion. <p> For more information on the layout algorithm and its available settings, see [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). </p>

| Name | Type |
|---|---|
| <div id="allowclusterasgroupsubstructure">allowClusterAsGroupSubstructure?</div> | <pre>boolean</pre> |
| <div id="allownodeoverlaps">allowNodeOverlaps?</div> | <pre>boolean</pre> |
| <div id="automaticgroupnodecompaction">automaticGroupNodeCompaction?</div> | <pre>boolean</pre> |
| <div id="avoidnodeedgeoverlap">avoidNodeEdgeOverlap?</div> | <pre>boolean</pre> |
| <div id="chainrecognition">chainRecognition?</div> | <pre>boolean</pre> |
| <div id="chainsubstructuresize">chainSubstructureSize?</div> | <pre>number</pre> |
| <div id="chainsubstructurestyle">chainSubstructureStyle?</div> | <pre>"none" &#124; "rectangular" &#124; "rectangular-nested" &#124; "straight-line" &#124; "straight-line-nested" &#124; "disk" &#124; "disk-nested"</pre> |
| <div id="circlerecognition">circleRecognition?</div> | <pre>boolean</pre> |
| <div id="clusteringpolicy">clusteringPolicy?</div> | <pre>"none" &#124; "louvain-modularity" &#124; "edge-betweenness" &#124; "label-propagation" &#124; "user-defined"</pre> |
| <div id="compactnessfactor">compactnessFactor?</div> | <pre>number</pre> |
| <div id="cyclesubstructuresize">cycleSubstructureSize?</div> | <pre>number</pre> |
| <div id="cyclesubstructurestyle">cycleSubstructureStyle?</div> | <pre>"none" &#124; "circular" &#124; "circular-nested"</pre> |
| <div id="defaultminimumnodedistance">defaultMinimumNodeDistance?</div> | <pre>number</pre> |
| <div id="defaultpreferrededgelength">defaultPreferredEdgeLength?</div> | <pre>number</pre> |
| <div id="deterministic">deterministic?</div> | <pre>boolean</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="groupnodecompactness">groupNodeCompactness?</div> | <pre>number</pre> |
| <div id="groupsubstructurescope">groupSubstructureScope?</div> | <pre>"no-groups" &#124; "groups-without-edges" &#124; "groups-without-inter-edges" &#124; "all-groups"</pre> |
| <div id="groupsubstructuresize">groupSubstructureSize?</div> | <pre>number</pre> |
| <div id="groupsubstructurestyle">groupSubstructureStyle?</div> | <pre>"circle" &#124; "compact-disk" &#124; "disk" &#124; "organic-disk"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom" &#124; "left-to-right" &#124; "right-to-left" &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore"</pre> |
| <div id="parallelsubstructuresize">parallelSubstructureSize?</div> | <pre>number</pre> |
| <div id="parallelsubstructurestyle">parallelSubstructureStyle?</div> | <pre>"none" &#124; "rectangular" &#124; "radial" &#124; "straight-line"</pre> |
| <div id="parallelsubstructuretypeseparation">parallelSubstructureTypeSeparation?</div> | <pre>boolean</pre> |
| <div id="preferredminimumnodetoedgedistance">preferredMinimumNodeToEdgeDistance?</div> | <pre>number</pre> |
| <div id="qualitytimeratio">qualityTimeRatio?</div> | <pre>number</pre> |
| <div id="starsubstructuresize">starSubstructureSize?</div> | <pre>number</pre> |
| <div id="starsubstructurestyle">starSubstructureStyle?</div> | <pre>"none" &#124; "radial" &#124; "radial-nested" &#124; "separated-radial" &#124; "circular" &#124; "circular-nested"</pre> |
| <div id="starsubstructuretypeseparation">starSubstructureTypeSeparation?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |
| <div id="treesubstructuresize">treeSubstructureSize?</div> | <pre>number</pre> |
| <div id="treesubstructurestyle">treeSubstructureStyle?</div> | <pre>"none" &#124; "oriented" &#124; "radial" &#124; "radial-tree"</pre> |
## OrganicLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). It allows for defining a function that provide values for each element.

For more information, see [OrganicLayoutData](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="minimumedgelengths">minimumEdgeLengths?</div> |  Provides the minimal length that an edge should have. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="minimumnodedistances">minimumNodeDistances?</div> |  Provides the minimal distance from a node to all other nodes. | <pre>(node: TNodeData) =&gt; number</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="preferrededgelengths">preferredEdgeLengths?</div> |  Provides the preferred length for an edge. It is not mandatory but works as a guidance length. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="scope">scope?</div> |  Provides which nodes should be placed. | <pre>**OrganicScopeDataProvider**&lt;TNodeData&gt;</pre> |


## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: OrganicLayoutOptions =
  {
    deterministic: true,
    defaultPreferredEdgeLength: 35,
    nodeLabelPlacement: 'consider'
  };

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  // call the useLayout-hook to get the function that invokes the layout
  const { runLayout } = useLayout();

  // run initial layout
  useNodesMeasuredEffect(() => {
    runLayout({
      name: 'OrganicLayout',
      layoutOptions
    });
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.000000000001}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Orthogonal Layout

The *orthogonal layout algorithm* arranges the graph in an orthogonal fashion such that each edge is drawn as an
alternating sequence of horizontal and vertical segments. It produces compact drawings with no overlapping nodes, few crossings and few bends
and is well suited for small and medium-sized sparse graphs.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/orthogonal-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Orthogonal layout"></img>
</div>

The orthogonal layout algorithm provides extensive customization options through a wide array of properties accessible
via the `OrthogonalLayoutOptions`. Fundamental options include different layout style and orientations, substructure detection, and more.
It also automatically places node and edge labels when the corresponding properties are activated.

Additional customization for individual graph elements, such as `edgeLabelPreferredPlacements`, `nodeMargins`, and more, can be achieved via
the `OrthogonalLayoutDataProvider`.

Feel free to play around with the orthogonal layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the orthogonal layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout).

```tsx
runLayout({
  name: 'OrthogonalLayout',
  layoutOptions: {
    edgeLabelPlacement: 'integrated',
    nodeLabelPlacement: 'consider',
    chainSubstructureStyle: 'straight'
  },
  layoutData: {
    edgeLabelPreferredPlacements: () => ({
      sideOfEdge: 'left-of-edge',
      distanceToEdge: 20,
    }),
    nodeMargins: () => 20
  }
})
```

## OrthogonalLayoutOptions

The configuration options for the Orthogonal layout algorithm that arranges graphs in an orthogonal fashion. <p> For more information on the layout algorithm and its available settings, see [OrthogonalLayout](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout). </p>

| Name | Type |
|---|---|
| <div id="aligndegreeonenodes">alignDegreeOneNodes?</div> | <pre>boolean</pre> |
| <div id="chainsubstructuresize">chainSubstructureSize?</div> | <pre>number</pre> |
| <div id="chainsubstructurestyle">chainSubstructureStyle?</div> | <pre>"none" &#124; "straight" &#124; "wrapped-with-nodes-at-turns" &#124; "wrapped-with-bends-at-turns"</pre> |
| <div id="cyclesubstructuresize">cycleSubstructureSize?</div> | <pre>number</pre> |
| <div id="cyclesubstructurestyle">cycleSubstructureStyle?</div> | <pre>"none" &#124; "circular" &#124; "circular-with-nodes-at-corners" &#124; "circular-with-bends-at-corners"</pre> |
| <div id="defaultedgedescriptor">defaultEdgeDescriptor?</div> | <pre>OrthogonalLayoutEdgeDescriptor</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="fromsketchmode">fromSketchMode?</div> | <pre>boolean</pre> |
| <div id="gridspacing">gridSpacing?</div> | <pre>number</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom" &#124; "left-to-right" &#124; "right-to-left" &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore"</pre> |
| <div id="preferparallelroutes">preferParallelRoutes?</div> | <pre>boolean</pre> |
| <div id="stopduration">stopDuration?</div> | <pre>number</pre> |
| <div id="treesubstructureorientation">treeSubstructureOrientation?</div> | <pre>"top-to-bottom" &#124; "bottom-to-top" &#124; "left-to-right" &#124; "right-to-left" &#124; "auto-detect"</pre> |
| <div id="treesubstructuresize">treeSubstructureSize?</div> | <pre>number</pre> |
| <div id="treesubstructurestyle">treeSubstructureStyle?</div> | <pre>"none" &#124; "default" &#124; "integrated" &#124; "compact" &#124; "aspect-ratio"</pre> |
| <div id="uniformportassignment">uniformPortAssignment?</div> | <pre>boolean</pre> |


## OrthogonalLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [OrthogonalLayout](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayout). It allows for defining a function that provide values for each element.

For more information, see [OrthogonalLayoutData](https://docs.yworks.com/yfileshtml/#/api/OrthogonalLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="edgedirectedness">edgeDirectedness?</div> |  Provides 0, 1, or -1 for each edge to indicate if it is undirected, in layout direction, or against layout direction. | <pre>(edge: TEdgeData) =&gt; number</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |
| <div id="sourcegroupids">sourceGroupIds?</div> |  Provides which edges should be grouped at source, i.e., share the beginning of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |
| <div id="targetgroupids">targetGroupIds?</div> |  Provides which edges should be grouped at target, i.e., share the end of their routes. | <pre>(edge: TEdgeData) =&gt; any</pre> |


## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: OrthogonalLayoutOptions =
  {
    edgeLabelPlacement: 'integrated'
  };

const layoutData: OrthogonalLayoutDataProvider<
  NodeProps,
  EdgeProps
> = {
  edgeLabelPreferredPlacements: () => ({
    angle: 0,
    angleReference:
      'relative-to-edge-flow'
  })
};

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'OrthogonalLayout',
      layoutOptions,
      layoutData
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.1}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Radial Layout

The *radial layout algorithm* is designed to arrange graphs in a radial fashion. The nodes are distributed into
circles (layers) around a common center based on predefined layering strategies.
Some potential applications include visualization of social networks, data clustering and bioinformatic.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/radial-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Radial layout"></img>
</div>

The radial layout algorithm provides extensive customization options through a wide array of properties accessible
via the `RadialLayoutOptions`. Fundamental options include layer spacing, center node policy, node and edge distances, and others.
It also automatically places node labels when the corresponding properties are activated. Node labels can also be
placed in a ray-like manner.

Additional customization for individual graph elements, such as `nodeTypes`, `nodeMargins`, and more, can be achieved via
the `RadialLayoutDataProvider`.

Feel free to play around with the radial layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the radial layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/RadialLayout).

```tsx
runLayout({
  name: 'RadialLayout',
  layoutOptions: {
    centerNodesPolicy: 'directed',
    nodeLabelPlacement: 'ray-like-leaves',
    minimumLayerDistance: 50
  },
  layoutData: {
    nodeMargins: () => 10
  }
})
```

## RadialLayoutOptions


The configuration options for the radial layout algorithm that arranges graphs in a radial fashion. <p> For more information on the layout algorithm and its available settings, see [RadialLayout](https://docs.yworks.com/yfileshtml/#/api/RadialLayout). </p>

| Name | Type |
|---|---|
| <div id="centernodespolicy">centerNodesPolicy?</div> | <pre>"directed" &#124; "centrality" &#124; "weighted-centrality"</pre> |
| <div id="createcontrolpoints">createControlPoints?</div> | <pre>boolean</pre> |
| <div id="edgeroutingstyle">edgeRoutingStyle?</div> | <pre>"polyline" &#124; "arc" &#124; "radial-polyline" &#124; "curved"</pre> |
| <div id="layeringstrategy">layeringStrategy?</div> | <pre>"bfs" &#124; "hierarchical" &#124; "dendrogram"</pre> |
| <div id="layerspacing">layerSpacing?</div> | <pre>number</pre> |
| <div id="maximumchildsectorangle">maximumChildSectorAngle?</div> | <pre>number</pre> |
| <div id="minimumbendangle">minimumBendAngle?</div> | <pre>number</pre> |
| <div id="minimumedgedistance">minimumEdgeDistance?</div> | <pre>number</pre> |
| <div id="minimumlayerdistance">minimumLayerDistance?</div> | <pre>number</pre> |
| <div id="minimumnodedistance">minimumNodeDistance?</div> | <pre>number</pre> |
| <div id="minimumsectordistance">minimumSectorDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "horizontal" &#124; "ignore" &#124; "ray-like" &#124; "ray-like-leaves"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |


## RadialLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [RadialLayout](https://docs.yworks.com/yfileshtml/#/api/RadialLayout). It allows for defining a function that provide values for each element.

For more information, see [RadialLayoutData](https://docs.yworks.com/yfileshtml/#/api/RadialLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="centernodes">centerNodes?</div> |  Provides which nodes should be placed on the innermost circle. | <pre>(node: TNodeData) =&gt; boolean</pre> |
| <div id="childorder">childOrder?</div> |  Provides an order for outgoing edges at the given node in which the edges are arranged. | <pre>**ChildOrderDataProvider**lt;TNodeData,TEdgeData&gt;</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: RadialLayoutOptions =
  {
    edgeRoutingStyle: 'arc'
  };

const layoutData: RadialLayoutDataProvider<
  NodeProps,
  EdgeProps
> = {
  centerNodes: (node: NodeProps) =>
    node.id === '2' ||
    node.id === '5' ||
    node.id === '9' ||
    node.id === '12' ||
    node.id === '20'
};

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'RadialLayout',
      layoutOptions,
      layoutData
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Radial Tree Layout

The *radial tree layout algorithm* is designed to arrange directed and undirected tree graphs.
Subtrees rooted at a node are placed in a radial fashion around their root node. All direct children of
one node can be placed on a common circle around their parent node (depending on the alignment policy).
Therefore, subtrees look like stars, especially if subtrees have similar sizes.
The edges of the tree are drawn as straight lines.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/radial-tree-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Radial tree layout"></img>
</div>

The radial tree layout algorithm provides extensive customization options through a wide array of properties accessible
via the `RadialTreeLayoutOptions`. Fundamental options include minimum node distances, children ordering, compactness, and others.
It also automatically places node and edge labels when the corresponding properties are activated. Node labels can also be
placed in a ray-like manner.

Additional customization for individual graph elements, such as `edgeLabelPreferredPlacements`, `nodeMargins`, and more, can be achieved via
the `RadialTreeLayoutDataProvider`.

Feel free to play around with the radial tree layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the radial tree layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout).

```tsx
runLayout({
  name: 'RadialTreeLayout',
  layoutOptions: {
    edgeLabelPlacement: 'integrated',
    nodeLabelPlacement: 'ray-like-leaves'
  },
  layoutData: {
    edgeLabelPreferredPlacements: () => ({
      sideOfEdge: 'left-of-edge',
      distanceToEdge: 20,
    })
  }
})
```

## RadialTreeLayoutOptions

The configuration options for the radial tree layout algorithm that arranges the subtrees of the tree graph in a radial fashion. <p> For more information on the layout algorithm and its available settings, see [RadialTreeLayout](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout).</p>

| Name | Type |
|---|---|
| <div id="allowoverlaps">allowOverlaps?</div> | <pre>boolean</pre> |
| <div id="chainstraighteningmode">chainStraighteningMode?</div> | <pre>boolean</pre> |
| <div id="childalignmentpolicy">childAlignmentPolicy?</div> | <pre>"plain" &#124; "same-center" &#124; "compact" &#124; "smart"</pre> |
| <div id="childorderingpolicy">childOrderingPolicy?</div> | <pre>"compact" &#124; "symmetric" &#124; "from-sketch"</pre> |
| <div id="compactnessfactor">compactnessFactor?</div> | <pre>number</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="edgelabelspacing">edgeLabelSpacing?</div> | <pre>number</pre> |
| <div id="minimumedgelength">minimumEdgeLength?</div> | <pre>number</pre> |
| <div id="minimumnodedistance">minimumNodeDistance?</div> | <pre>number</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "horizontal" &#124; "ignore" &#124; "ray-like" &#124; "ray-like-leaves"</pre> |
| <div id="nodelabelspacing">nodeLabelSpacing?</div> | <pre>number</pre> |
| <div id="preferredchildsectorangle">preferredChildSectorAngle?</div> | <pre>number</pre> |
| <div id="preferredrootsectorangle">preferredRootSectorAngle?</div> | <pre>number</pre> |
| <div id="rootselectionpolicy">rootSelectionPolicy?</div> | <pre>"directed-root" &#124; "center-root" &#124; "weighted-center-root"</pre> |



## RadialTreeLayoutDataProvider&lt;TNodeData, TEdgeData&gt;

A provider for individual options per nodes or edges in a [RadialTreeLayout](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout). It allows for defining a function that provide values for each element.

For more information, see [RadialTreeLayoutData](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="childorder">childOrder?</div> |  Provides an order for the given edges in which the edges are arranged at a node. | <pre>**ChildOrderDataProvider**lt;TNodeData,TEdgeData&gt;</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |

## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: RadialTreeLayoutOptions =
  {
    edgeLabelPlacement: 'integrated',
    nodeLabelPlacement: 'ray-like'
  };

const layoutData: RadialTreeLayoutDataProvider<
  NodeProps,
  EdgeProps
> = {
  childOrder: {
    outEdgeComparators:
      () => (edge1, edge2) =>
        parseInt(edge1?.target) -
        parseInt(edge2?.target)
  }
};

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'RadialTreeLayout',
      layoutOptions,
      layoutData
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.1}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```


## Tree Layout

The *Tree layout algorithm* is designed to arrange graphs in a tree fashion. It provides multiple different
arrangements of trees and subtrees. Tree layout algorithms are commonly applied to visualize relational
data and produce diagrams of high quality that are able to reveal possible hierarchical properties of
the graph. More precisely, they find applications in dataflow analysis, software engineering,
bioinformatics and business administration.

<div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '40px 0'}}>
  <img src={`${import.meta.env.BASE_URL}/tree-layout.png`} style={{maxWidth: "80%", objectFit: "cover"}} alt="Compact tree layout"></img>
</div>

The tree layout algorithm provides extensive customization options through a wide array of properties accessible
via the `TreeLayoutOptions`. Fundamental options include the custom ordering of the edges, the port assignment,
the arrangement of the nodes for each subtree., and others.
It also automatically places node labels when the corresponding properties are activated.

Additional customization for individual graph elements, such as `edgeLabelPreferredPlacements`, `nodeMargins`, and more, can be achieved via
the `TreeLayoutDataProvider`.

Feel free to play around with the tree layout configuration in our [online playground](#my-playground).

Extensive documentation detailing all available properties of the Tree layout supported by *yFiles layouts for React Flow* can be
found [here](https://docs.yworks.com/yfileshtml/#/api/TreeLayout).

```tsx
runLayout({
  name: 'TreeLayout',
  layoutOptions: {
    allowMultiParent: true,
    edgeLabelPlacement: 'integrated',
    layoutOrientation: 'left-to-right'
  },
  layoutData: {
    edgeLabelPreferredPlacements: () => ({
      edgeSize: 'left-of-edge',
      distanceToEdge: 20,
    }),
  }
})
```

## TreeLayoutOptions

The configuration options for the tree layout algorithm that arranges graphs with a tree structure. <p> For more information on the layout algorithm and its available settings, see [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). </p>


| Name | Type |
|---|---|
| <div id="allowmultiparent">allowMultiParent?</div> | <pre>boolean</pre> |
| <div id="defaultsubtreeplacer">defaultSubtreePlacer?</div> | <pre>ISubtreePlacer</pre> |
| <div id="edgelabelplacement">edgeLabelPlacement?</div> | <pre>"generic" &#124; "ignore" &#124; "integrated"</pre> |
| <div id="layoutorientation">layoutOrientation?</div> | <pre>"top-to-bottom" &#124; "left-to-right" &#124; "right-to-left" &#124; "bottom-to-top"</pre> |
| <div id="nodelabelplacement">nodeLabelPlacement?</div> | <pre>"consider" &#124; "generic" &#124; "ignore"</pre> |


## TreeLayoutDataProvider&lt;TNodeData, TEdgeData, TLabelData&gt;

A provider for individual options per nodes or edges in a [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). It allows for defining a function that provide values for each element.

For more information, see [TreeLayoutData](https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData).

| Name | Description | Type |
|---|---|---|
| <div id="assistantnodes">assistantNodes?</div> |  Provides which nodes should be placed separately from their siblings. | <pre>(node: TNodeData) =&gt; boolean</pre> |
| <div id="childorder">childOrder?</div> |  Provides an order for outgoing edges at the given node in which the edges are arranged. | <pre>**ChildOrderDataProvider**lt;TNodeData,TEdgeData&gt;</pre> |
| <div id="edgelabelpreferredplacements">edgeLabelPreferredPlacements?</div> |  Provides descriptors for the placement of edge labels. | <pre>(label: **LabelData**) =&gt; **EdgeLabelPreferredPlacement**</pre> |
| <div id="groupnodepadding">groupNodePadding?</div> |  Provides the paddings for the group nodes, i.e., a rectangular area like padding in the interior of the node. | <pre>(node: TNodeData) =&gt; **Insets**</pre> |
| <div id="nodemargins">nodeMargins?</div> |  Provides margins for nodes, i.e., a rectangular area around a specific node considered during the layout. | <pre>(node: TNodeData) =&gt; **NodeMargins**</pre> |
| <div id="nodetypes">nodeTypes?</div> |  Provides types which can influence the ordering of nodes during layout. | <pre>(node: TNodeData) =&gt; any</pre> |


## Playground

### Source Code Example

```jsx
// edge type that supports bends
const edgeTypes = {
  default: PolylineEdge
};
// node type that supports multiple handles
const nodeTypes = {
  default: MultiHandleNode
};

// initialize data
const initialNodes = data.nodes;
const initialEdges = data.edges;

const layoutOptions: TreeLayoutOptions =
  {
    edgeLabelPlacement: 'integrated',
    defaultSubtreePlacer:
      new yfiles.AssistantSubtreePlacer(
        {
          childSubtreePlacer:
            new yfiles.LeftRightSubtreePlacer()
        }
      )
  };

const layoutData: TreeLayoutDataProvider<
  NodeProps,
  EdgeProps
> = {
  assistantNodes: (node) =>
    node.data.assistant as boolean,
  nodeMargins: () => 10
};

function LayoutFlow() {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);
  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  const { runLayout } = useLayout();

  useNodesMeasuredEffect(() =>
    runLayout({
      name: 'TreeLayout',
      layoutOptions,
      layoutData
    })
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.1}
    ></ReactFlow>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow></LayoutFlow>
    </ReactFlowProvider>
  );
}

```