# Vite + React Components Guide

This project mounts React components from Rails views using the `component()` helper and a dynamic auto-loader.

## Entry Points

- Rails view helper: `app/helpers/components_helper.rb`
- Vite entrypoint: `app/javascript/entrypoints/application.js`
- Mount utility: `app/javascript/utils/mountAllComponents.js`

## Mounting Flow

1. Rails renders:

```erb
<%= component("Menu", slug: @restaurant.slug) %>
```

2. Helper emits:

- `data-react-component="Menu"`
- `data-props='{"slug":"..."}'`

3. `mountAllComponents()` scans `[data-react-component]`, resolves module via `import.meta.glob('../components/**/*.jsx')`, and mounts it with React 18 `createRoot`.

## Naming Rules

- Component file extension must be `.jsx`.
- Names must match the helper argument and relative path.

Examples:

- `component("Home")` -> `app/javascript/components/Home.jsx`
- `component("admin/OrdersDashboard")` -> `app/javascript/components/admin/OrdersDashboard.jsx`
- `component("super_admin/RestaurantsManager")` -> `app/javascript/components/super_admin/RestaurantsManager.jsx`

## Path Aliases

Configured in `vite.config.js`:

- `@components` -> `app/javascript/components`
- `@utils` -> `app/javascript/utils`

## Best Practices

1. Keep Rails views as thin shells for root React components.
2. Keep API access and state logic inside React components/utils.
3. Prefer small reusable components for shared UI behavior.
4. Validate incoming props defensively (types/shape checks).

## Common Issues

- "Component not found" in console:
  - helper name/path does not match file path under `components/**`
- Props parse errors:
  - non-JSON-safe values passed to `component()` helper
- No mount at all:
  - missing Vite entrypoint include in layout

## Performance Notes

- Use route-level/component-level splitting where appropriate.
- `import.meta.glob` already loads modules lazily on demand.
