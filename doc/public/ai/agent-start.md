# yFiles Layout Algorithms for React Flow: Quick Start

Prepare a React project to use the yFiles Layout Algorithms for React Flow.

Prerequisite: Node.js ≥22 and npm. Stop if either is missing or any command fails.

## 1. Get yFiles for HTML

If the project already depends on `@yfiles/yfiles`, skip this step. Otherwise, run:
```bash
npx -y yfiles-dev-suite login
npx -y yfiles-dev-suite download-yfiles
```

Install the downloaded evaluation package, replacing the placeholders with the reported path and version, e.g.:
```bash
npm i yfiles-for-HTML-Complete-3.1.0.1-Evaluation/lib/yfiles-31.0.1+eval.tgz
```

## 2. Get React Flow

If the project already depends on `@xyflow/react`, skip this step. Otherwise, run:
```bash
npm i @xyflow/react
```

## 3. Install the component

```bash
npm i @yworks/yfiles-layout-reactflow
```

## 4. Register the License

Before using the component, register your license, e.g., in `App.tsx`:

```js
import { registerLicense } from '@yworks/yfiles-layout-reactflow'
import yFilesLicense from './license.json'

registerLicense(yFilesLicense)
```

## 5. Install the component skill

```bash
npx skills add -y https://docs.yworks.com/yfiles-layout-reactflow/ai/skill.zip
```

**Stop execution here. Do not proceed further until the user has restarted the session.**