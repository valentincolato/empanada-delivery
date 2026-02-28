# Frontend Guidelines (React + Hooks + FE Patterns)

## 1) Objetivo

Estandarizar como construimos frontend en este proyecto para que el codigo sea:

- Correcto (menos bugs de estado/efectos).
- Mantenible (componentes pequenos, responsabilidades claras).
- Accesible (WCAG/ARIA correctos).
- Rapido (Core Web Vitals y UX estables).
- Seguro (evitar XSS/CSRF y malas practicas de almacenamiento).

Esta guia combina:

- Reglas oficiales (React, W3C, MDN, web.dev, OWASP, ESLint).
- Patrones de equipo derivados de esas reglas para uso diario.

## 2) Reglas base (obligatorias)

### 2.1 Componentes React

1. Componentes y Hooks deben ser puros:
- No mutar `props` ni `state`.
- No disparar efectos secundarios durante render.

2. Nunca llamar componentes como funciones:
- Correcto: `<MyComponent />`.
- Incorrecto: `MyComponent()`.

3. Mantener responsabilidad unica por componente:
- UI/presentacion separada de fetch/mutaciones/normalizacion.

### 2.2 Hooks

1. Respetar Rules of Hooks:
- Llamar hooks solo en el top-level.
- No hooks en `if`, loops, callbacks, `try/catch`, funciones normales.

2. Usar `eslint-plugin-react-hooks` y no ignorar reglas sin razon documentada.

3. Custom Hooks:
- Nombre `useXxx`.
- Reutilizan logica stateful, no comparten estado por magia.
- API pequena y especifica al caso de uso.

### 2.3 Estado

1. Elegir estructura de estado minima:
- Evitar estado redundante o derivable.
- Evitar duplicacion y nesting profundo cuando no aporta valor.
- Evitar estados imposibles (flags contradictorios).

2. Derivar en render cuando se pueda:
- Si se calcula desde props/state actual, no guardarlo en `useState`.

3. Mantener inmutabilidad en actualizaciones.

### 2.4 Efectos

1. Aplicar "You Might Not Need an Effect":
- Si no sincroniza con sistema externo (DOM imperativo, red, subscripcion), probablemente no necesita `useEffect`.

2. Efectos para sincronizar, no para modelar eventos de UI.

3. Dependencias completas:
- No ocultar deps para "que no se dispare".
- Ajustar codigo para que la lista de deps sea correcta.

4. Cleanup obligatorio para subscripciones, timers, listeners y fetch cancelables.

### 2.5 Data fetching en componentes

1. Cancelar requests en race conditions/unmount con `AbortController`.

2. Normalizar estados de red por recurso:
- `idle | loading | success | error`.

3. No mezclar rendering con detalles HTTP:
- Encapsular en `hooks/` o capa `services/api`.

### 2.6 Renderizado de listas

1. Toda lista renderizada con `map` debe tener `key` estable.

2. No usar `index` como `key` si la lista cambia (insert/reorder/delete).

3. Nunca usar `Math.random()` o valores no estables como key.

### 2.7 Formularios e inputs

1. Preferir componentes controlados para flujos criticos.

2. Todo control de formulario debe tener label visible y asociada.

3. No usar placeholder como reemplazo de label.

4. Botones icon-only deben tener nombre accesible.

### 2.8 Accesibilidad (A11y)

1. Usar HTML semantico primero (`button`, `label`, `nav`, `main`, etc.).

2. ARIA solo cuando semantica nativa no alcance.
- Regla: "No ARIA is better than bad ARIA".

3. Todo elemento interactivo debe tener nombre accesible.

4. Seguir WCAG 2.2 como baseline de calidad.

5. Para widgets complejos, seguir APG (ARIA Authoring Practices Guide).

### 2.9 Performance

1. Medir Core Web Vitals en campo (RUM), no solo local/lab.

2. Objetivos minimos:
- LCP <= 2.5s (p75)
- INP <= 200ms (p75)
- CLS <= 0.1 (p75)

3. Lazy loading en imagenes/iframes no criticos (`loading="lazy"`).

4. Evitar renders costosos innecesarios:
- Memorizar solo donde exista evidencia de costo real.

### 2.10 Seguridad FE

1. Mantener escaping por defecto del framework; no inyectar HTML sin sanitizacion.

2. Evitar superficies XSS:
- No usar sinks inseguros sin control.
- Revisar uso de HTML dinamico.

3. Aplicar CSP y monitorear en rollout con `Content-Security-Policy-Report-Only`.

4. En auth/sesiones, respetar mitigaciones CSRF del backend y no romper flujo de tokens.

5. No guardar datos sensibles en `localStorage` sin evaluacion de riesgo.

### 2.11 Testing FE

1. Priorizar pruebas orientadas a comportamiento de usuario y DOM real.

2. Evitar tests acoplados a detalles internos de implementacion.

3. Mockear solo limites de sistema (network, tiempo, APIs externas), no todo.

4. Mantener tests deterministas y rapidos (sin flakes).

## 3) Patrones FE recomendados

### 3.1 Pattern: Container + Presentational

Cuando usar:
- Pantallas con logica de negocio, fetch y varias sub-secciones visuales.

Como aplicar:
- `ScreenContainer`: orquesta datos, loading/error, handlers.
- `ScreenView`: recibe props planas y renderiza UI.

Beneficio:
- Facilita testeo, refactor y reutilizacion de UI.

### 3.2 Pattern: Custom Hook por caso de uso

Cuando usar:
- Logica repetida en >=2 componentes o logica compleja en uno.

Como aplicar:
- `useOrdersBoard()`, `useCartState()`, `useRestaurantSearch()`.
- Retornar estado + acciones + metadata minima (`loading`, `error`).

Beneficio:
- Encapsula complejidad y mantiene componentes limpios.

### 3.3 Pattern: Resource State Machine

Cuando usar:
- Cualquier recurso async (lista, detalle, mutacion).

Como aplicar:
- Modelo unico: `idle/loading/success/error`.
- UI explicita por estado (skeleton, error CTA, empty state).

Beneficio:
- Evita estados ambiguos y condiciones incompletas.

### 3.4 Pattern: Derivacion en render

Cuando usar:
- Datos computables desde estado actual.

Como aplicar:
- `const visibleItems = items.filter(...)` en render o memo puntual.
- No duplicar en `useState` + `useEffect`.

Beneficio:
- Menos bugs de sincronizacion.

### 3.5 Pattern: Formularios consistentes

Cuando usar:
- Flujos de checkout, login, alta/edicion admin.

Como aplicar:
- Inputs controlados.
- Validacion por capa (UI + dominio/backend).
- Mensajes de error claros, asociados a campo.

Beneficio:
- Mejor UX y menos errores silenciosos.

### 3.6 Pattern: Error Boundary + Fallback UX

Cuando usar:
- Secciones grandes del arbol UI con riesgo de falla aislable.

Como aplicar:
- Boundary por zonas (dashboard, menu publico, modales complejos).
- Fallback accionable con retry o camino alterno.

Beneficio:
- Evita que una falla rompa toda la pantalla.

### 3.7 Pattern: Accesibilidad por defecto

Cuando usar:
- Siempre.

Como aplicar:
- Semantica nativa primero.
- Foco visible.
- Navegacion por teclado para widgets custom.
- Labels y nombres accesibles.

Beneficio:
- Cumplimiento normativo y mejor usabilidad general.

### 3.8 Pattern: Performance budget por feature

Cuando usar:
- Nuevas pantallas o features con impacto de carga/interaccion.

Como aplicar:
- Definir objetivo de CWV por ruta.
- Revisar bundles y recursos criticos.
- Lazy-load de bloques no criticos.

Beneficio:
- Evita degradacion gradual del producto.

## 4) Anti-patterns a evitar

1. `useEffect` para calcular datos derivados.
2. Silenciar `exhaustive-deps` sin justificar.
3. Keys inestables en listas.
4. Mezclar fetch/render/mutacion en un solo componente gigante.
5. Usar ARIA para reemplazar HTML semantico existente.
6. Inputs sin label visible.
7. Tratar errores con `alert()` como unica UX.
8. Guardar secretos/tokenes sensibles en storage web sin evaluacion.

## 5) Checklist de PR FE

1. Hooks cumplen Rules of Hooks.
2. No hay estado redundante ni imposible.
3. Efectos tienen dependencia correcta + cleanup.
4. Listas con key estable.
5. Formularios con labels y errores accesibles.
6. No hay regresiones de keyboard navigation.
7. Se midio impacto de performance (al menos baseline local + plan RUM).
8. Cobertura de tests sobre comportamiento usuario.
9. Riesgos de seguridad revisados (XSS/CSRF/CSP segun aplique).
10. Codigo dividido en componentes/hook reutilizables (sin mega-componente).

## 6) Fuentes oficiales

### React (oficial)

- Rules of React: https://react.dev/reference/rules
- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- rules-of-hooks lint: https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks
- Choosing the State Structure: https://react.dev/learn/choosing-the-state-structure
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect
- Synchronizing with Effects: https://react.dev/learn/synchronizing-with-effects
- Lifecycle of Reactive Effects: https://react.dev/learn/lifecycle-of-reactive-effects
- Reusing Logic with Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- Rendering Lists (keys): https://react.dev/learn/rendering-lists

### Accesibilidad y HTML (oficial)

- WCAG Overview (W3C/WAI): https://www.w3.org/WAI/standards-guidelines/wcag/
- ARIA APG Home (W3C): https://www.w3.org/WAI/ARIA/apg/
- ARIA Practices (W3C): https://www.w3.org/WAI/ARIA/apg/practices/
- MDN ARIA Guide: https://developer.mozilla.org/docs/Web/Accessibility/ARIA
- MDN Text labels and names: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Text_labels_and_names
- MDN `<label>`: https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/label
- MDN `<button>` accessibility: https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/button

### Performance (oficial)

- web.dev Web Vitals/Core Web Vitals: https://web.dev/articles/vitals
- MDN Lazy loading: https://developer.mozilla.org/docs/Web/Performance/Lazy_loading
- MDN AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController

### Seguridad (oficial)

- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- MDN Content-Security-Policy header: https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/Content-Security-Policy
- MDN CSP Report-Only: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only

### Calidad de codigo y testing (oficial)

- ESLint Configure Rules: https://eslint.org/docs/latest/use/configure/rules
- eslint-plugin-react-hooks (NPM oficial del plugin): https://www.npmjs.com/package/eslint-plugin-react-hooks
- Testing Library Guiding Principles: https://testing-library.com/docs/guiding-principles

