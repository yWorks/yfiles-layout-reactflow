---
title: Getting Started
section: 1
tags: []
---

# Getting Started

1. **Installation:**
   Install the module via npm by running the following command in your project directory:
   ```bash
   npm install @yworks/yfiles-layout-reactflow
   ```

   The module has certain peer dependencies that must be installed within your project. Since it is a React module that augments React Flow, `react`, `react-dom`, and `reactflow` dependencies are needed.

   Additionally, the module relies on the [yFiles](https://www.yworks.com/yfiles-overview) library which is not available on the public npm registry. Find instructions on how to work with the yFiles npm module in our [Developer's Guide](https://docs.yworks.com/yfileshtml/#/dguide/yfiles_npm_module).

   Ensure that the dependencies in the `package.json` file resemble the following:
   ```json
   {
     "dependencies": {
       "@yworks/yfiles-layout-reactflow": "^1.0.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "reactflow": "^11.11.0",
       "yfiles": "<yFiles package path>/lib/yfiles-26.0.0.tgz"
     }
   }
   ```

2. **License:**
   A valid version of [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html) is required for using the module. You can evaluate yFiles free of charge for 60 days on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).
   Be sure to invoke the `registerLicense` function to provide the license file before using the yFiles layout module.

3. **Usage:**
   Utilize the `useLayout`-hook in your React Flow application. First invoke `registerLicense` somewhere in your application.

   ```tsx
   // App.tsx
   import { registerLicense } from '@yworks/yfiles-layout-reactflow'
   import yFilesLicense from './license.json'
   
   function App() {
     registerLicense(yFilesLicense)
     return <Flow></Flow>
   }
    
   export default App
   ```
   Then create a custom flow with a layout button.

   ```tsx
   // Flow.tsx
   import { useCallback } from 'react'
   import ReactFlow, {
     addEdge,
     Connection,
     EdgeProps,
     NodeProps,
     Panel,
     ReactFlowProvider,
     useEdgesState,
     useNodesState
   } from 'reactflow'
   import 'reactflow/dist/style.css'
   import { MultiHandleNode, PolylineEdge, useLayout } from '@yworks/yfiles-layout-reactflow'
   
   import initialNodes from './nodes.json'
   import initialEdges from './edges.json'
   
   // use the node and edge types that can process the layout result
   // including multiple handles and bends in edges
   const edgeTypes = {
     default: PolylineEdge
   }
   const nodeTypes = {
     default: MultiHandleNode
   }
   
   function LayoutFlow() {
     const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
     const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
   
     const onConnect = useCallback(
       (connection:Connection) => setEdges((eds) => addEdge(connection, eds)),
       [setEdges]
     );
   
     // use the layout-hook to configure the layout algorithm
     const { runLayout } = useLayout()
   
     return (
       <ReactFlow
         nodes={nodes}
         edges={edges}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         nodeTypes={nodeTypes}
         edgeTypes={edgeTypes}
       >
         <Panel position="top-left">
           <button onClick={() => runLayout('HierarchicLayout')}>Run Layout</button>
         </Panel>
       </ReactFlow>
     );
   }
   
   export default function Flow() {
     return (
       <ReactFlowProvider>
         <LayoutFlow />
       </ReactFlowProvider>
     )
   }

   ```

   > **Note:** To effectively visualize the outcome of the layout algorithm, it is essential to use
   [Node and Edge types](../features/customelementtypes) that are capable of accommodating multiple handles and polyline paths.


## Learn More
Discover the variety of yFiles layout algorithms available with yFiles Layout Algorithms for React Flow. 
For further information about [yFiles for HTML](https://www.yworks.com/yfiles-overview) and our company, please visit [yWorks.com](https://www.yworks.com).

For support or feedback, please reach out to [our support team](https://www.yworks.com/contact) or open an [issue on GitHub](https://github.com/yWorks/yfiles-layout-reactflow/issues). Happy diagramming!
