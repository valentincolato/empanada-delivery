# Actions Pattern

Actions encapsulate business logic following the command pattern. They live in `app/actions/` and provide a consistent interface for operations that may succeed or fail.

## Basic Structure

```ruby
class MyAction < BaseAction
  attr_accessor :input1, :input2

  validates_presence_of :input1
  validates :input2, numericality: true

  def setup
    # Optional: compute derived state after initialization
    @derived = compute_something
  end

  def perform
    # Business logic here
    fail!(:something_wrong) if bad_condition
    success!(result)
  end
end
```

## Usage

```ruby
result = MyAction.call(input1: "foo", input2: 42)

if result.success?
  result.value  # the payload
else
  result.value  # the error
end
```

## Key Methods

| Method | Purpose |
|--------|---------|
| `success!(value)` | Return successful result |
| `fail!(error)` | Raise and return failure (early exit) |
| `failure!(error)` | Return failure without raising (no early exit) |

## Organizing Complex Actions with Steps

For actions with multiple operations and distinct failure modes, organize `perform` as a sequence of step methods. Each step either fails early with `fail!` or returns a value for subsequent steps.

### When to Use Steps

- Actions with 3+ distinct operations
- When `perform` exceeds ~15 lines
- Multiple failure conditions that benefit from co-location with their logic

### When to Keep It Simple

- Simple actions with linear flow
- Single failure point
- Less than 10 lines of logic

### Example: Before and After

**Before** - all logic in perform:

```ruby
def perform
  fail!(:blank_mail_or_recipient) if mail.body.blank? || mail.to.blank?

  payload = decode_token
  fail!(:blank_token) if payload.blank?

  author_type, author_id, lead_id = payload
  fail!(:invalid_token) unless author_type && author_id
  author_class = HashableIds::MODEL_IDENTIFIERS.invert[author_type].to_s.constantize
  fail!(:invalid_broker_token) if author_class == User && !lead_id

  author = author_class.find_by(id: author_id)
  fail!(:author_not_found) if author.blank?

  lead = author.is_a?(Lead) ? author : Lead.find_by(id: lead_id)
  fail!(:lead_not_found) if lead.blank?

  message = Message.new(body: plain_text_reply, lead: lead, author: author)
  if message.save
    success!(message)
  else
    fail!(message.errors)
  end
end
```

**After** - organized as steps:

```ruby
def perform
  validate_mail_present
  token_data = extract_token_data
  author = find_author(token_data)
  lead = find_lead(author, token_data)
  save_message(author, lead)
end

private

def validate_mail_present
  fail!(:blank_mail_or_recipient) if mail.body.blank? || mail.to.blank?
end

def extract_token_data
  payload = decode_token
  fail!(:blank_token) if payload.blank?

  author_type, author_id, lead_id = payload
  fail!(:invalid_token) unless author_type && author_id

  author_class = HashableIds::MODEL_IDENTIFIERS.invert[author_type].to_s.constantize
  fail!(:invalid_broker_token) if author_class == User && !lead_id

  { author_class:, author_id:, lead_id: }
end

def find_author(token_data)
  author = token_data[:author_class].find_by(id: token_data[:author_id])
  fail!(:author_not_found) if author.blank?
  author
end

def find_lead(author, token_data)
  lead = author.is_a?(Lead) ? author : Lead.find_by(id: token_data[:lead_id])
  fail!(:lead_not_found) if lead.blank?
  lead
end

def save_message(author, lead)
  message = Message.new(body: plain_text_reply, lead: lead, author: author)
  fail!(message.errors) unless message.save
  success!(message)
end
```

### Benefits

- `perform` reads as a high-level process description
- Each step is independently testable
- Error conditions are co-located with the logic that triggers them
- Easier to understand the happy path at a glance

### Guidelines for Step Methods

1. **Name steps as verbs** describing what they do: `validate_`, `find_`, `create_`, `save_`
2. **Fail early** - check error conditions at the start of each step
3. **Return values** - steps should return the computed value for use by subsequent steps
4. **Keep steps focused** - one logical operation per step

## When to Use Actions (Sweet Spot)

Actions are the right choice when you have:

1. **A command** — a write operation with side effects
2. **Meaningful success/failure outcomes** — the caller needs to handle both cases
3. **Input validation requirements** — leverage `ActiveModel::Validations`
4. **15-80 lines of focused business logic** — enough complexity to warrant encapsulation
5. **Multiple potential failure points** — benefit from `fail!` early exits

**Good examples in this codebase:**
- `LeadMessages::CreateAction` — parses email, validates tokens, creates message with multiple failure modes
- `ToggleFeaturedAction` — enforces business rules around quota limits
- `LeadMessages::DeliverAction` — orchestrates email delivery with branching logic based on author type

## When to Avoid Actions

| Scenario | Why Not an Action | Alternative |
|----------|-------------------|-------------|
| Building search/filter queries | No command semantics, read-only | Query Object (`app/queries/`) |
| Static utility methods | No instance, no success/failure | Utility module in `app/lib/` |
| API client wrappers | Infrastructure, not domain logic | Client (`app/clients/`) |
| Trivial CRUD (<10 lines) | Overhead exceeds benefit | Model method or controller |
| Fire-and-forget side effects | No meaningful return value | Background Job (`app/jobs/`) |
| Operations requiring pattern violations | Pattern doesn't fit | Plain class or different pattern |
| 200+ lines of mixed concerns | Too much responsibility | Decompose or use orchestrator |

### Red Flags That an Action Doesn't Fit

- **Overriding `call` instead of `perform`** — breaking the pattern's contract
- **Returning `self` instead of `Success`/`Failure`** — not using the monad semantics
- **No `success!` call anywhere** — the operation has no meaningful result
- **All class methods, no instance state** — it's a utility, not a command
- **Returning plain hashes** — not using the pattern's result type