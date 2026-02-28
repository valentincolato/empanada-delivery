# 🧩 Vite components
## New JS File

The new JS file is located on `app/javascript/entrypoints/application.js`
## 📁 Structure

All React components should be placed under:

`app/javascript/components/`

## Root Component vs. Internal Component

A **Root Component** is one that gets mounted directly from an `.erb` view using `component("Name")`.

### If **yes**, it is a Root Component:

1. The file name must match the component name.
   - Example:
     - File: `Register.jsx`
     - Export: `export default function Register() { ... }`
     - In the `.erb` view: `<%= component("Register") %>`

2. The component will be automatically mounted by `mountAllComponents`.

### If **no**, it is not a Root Component:

1. Just make sure the component is inside the `components` folder.
2. You can import and use it normally inside other components:

    `import SomeChild from '@components/SomeChild'`

## Auto-Mounting System

In the past, you had to manually register components in a hash so they could be mounted from backend views.  
**That is no longer necessary.**

Now all components are automatically loads from the `components` folder. Components are mounted dynamically based on the DOM using the helper `component` in `.erb` views.

## Useful Vite Configuration Details

### Aliases
We have configured the following path aliases in `vite.config.js`:
```js
resolve: {
  alias: {
    '@components': path.resolve(__dirname, 'app/javascript/components'),
    '@utils': path.resolve(__dirname, 'app/javascript/utils')
  }
}
```

This allows for cleaner imports:
```js
import MyComponent from '@components/MyComponent';
import { helper } from '@utils/helper';
```

### JavaScript Bundle Report
You can generate a JavaScript bundle report to analyze sizes using:
```js
vite build --report
```
This opens a visual breakdown of your JS bundles using rollup-plugin-visualizer.

### Heavy Libraries and Manual Chunking

For large libraries like `react-apexcharts` or `react-quill`, we:

1. Use React.lazy and Suspense to load them only when needed.

2. Define a manual chunk in vite.config.js to separate them into their own bundle:

```js
manualChunks: {
  vendor: ['react', 'react-dom'],
  apexcharts: ['react-apexcharts'],
  reactquill: ['react-quill'],
}
```
This improves the initial load time by deferring large dependencies.
