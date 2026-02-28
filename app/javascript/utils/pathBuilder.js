export function fillPath(template, params = {}) {
  if (!template) return ''

  return Object.entries(params).reduce((path, [key, value]) => (
    path.replace(`:${key}`, encodeURIComponent(String(value)))
  ), template)
}
