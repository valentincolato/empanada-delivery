# Pattern Guide: Problem Details (RFC 9457) for API Errors

## Context in This Project

Current API errors are not fully standardized (`{ error: ... }` in some endpoints, `{ errors: [...] }` in others). This creates inconsistent frontend handling.

## Pattern Summary

Adopt RFC 9457 "Problem Details for HTTP APIs" as the common error envelope.

Content type:

- `application/problem+json`

## Target Error Shape

```json
{
  "type": "https://api.empanada.dev/problems/invalid-order-transition",
  "title": "Invalid order transition",
  "status": 422,
  "detail": "Invalid status transition: pending -> delivered",
  "instance": "/api/v1/admin/orders/123",
  "errors": {
    "status": ["is not allowed from pending"]
  }
}
```

## Mapping Guidance

- Validation errors -> `422`
- Unauthorized/forbidden -> `401/403`
- Not found -> `404`
- Conflict (idempotency/payload mismatch) -> `409`
- Unexpected errors -> `500` with generic safe `detail`

## Implementation Plan

1. Add `Api::ProblemRenderer` helper/service.
2. Replace ad-hoc render blocks in API controllers.
3. Add stable `type` URIs for recurring error categories.
4. Update frontend `@utils/api.js` to parse Problem Details consistently.

## Testing Checklist

- Every non-2xx API response uses Problem Details envelope.
- Status code and `status` field always match.
- `type` values are stable and documented.
- Sensitive internals are never leaked in `detail`.

## References (checked: February 28, 2026)

- RFC 9457 (Problem Details for HTTP APIs): https://www.rfc-editor.org/rfc/rfc9457
- Zalando RESTful API Guidelines (Problem Details usage): https://opensource.zalando.com/restful-api-guidelines/
