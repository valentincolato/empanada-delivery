# Architecture

## Purpose

This document defines **where business logic lives** in this application and **how to decide** where new code should go.

The goal is:

* Consistency across the team
* Low cognitive load for new contributors
* Minimal abstraction, maximum clarity

This is a **Vanilla Rails** application with a small number of explicit rules.

---

## Core Concepts

### 1. Aggregates

An **aggregate** is a group of domain objects that must remain consistent together.

* Represented by a single **aggregate root**
* Other objects are modified *through* the root
* Usually an ActiveRecord model

**Examples**

* `Boat` (with pricing, availability, photos)
* `Lead` (with messages, status changes)

**Rule**

> If logic affects only one aggregate, it belongs on the aggregate root.

```ruby
# GOOD
lead.add_message!(author:, body:)

# BAD
Message.create!(lead: lead, ...)
```

---

### 2. Workflows

A **workflow** coordinates multiple aggregates or external systems to accomplish a business action.

* Named after a **business event**
* Implemented as a plain Ruby object
* No inheritance, no framework
* Called by controllers, jobs, or webhooks

**Rule**

> If logic touches more than one aggregate, it is a workflow.

**Examples**

* `CreateLead`
* `CloseLeadAsSold`
* `RespondToInquiry`

```ruby
# app/workflows/create_lead.rb
class CreateLead
  def initialize(boat:, buyer:, params:)
    @boat = boat
    @buyer = buyer
    @params = params
  end

  def call
    Lead.transaction do
      lead = Lead.create!(...)
      lead.add_message!(...)
      NotifySellerJob.perform_later(lead.id)
      lead
    end
  end
end
```

All workflows live in:

```
app/workflows/
```

---

### 3. Controllers, Jobs, Webhooks

These are **entry points**, not business logic containers.

They may:

* Parse input
* Authorize
* Call a workflow or aggregate method

They may NOT:

* Coordinate multiple aggregates
* Contain business rules

```ruby
# GOOD
CreateLead.new(...).call

# BAD
Lead.create!(...)
Boat.increment!(...)
Notifier.send(...)
```

---

### 4. External Services

Third-party systems are wrapped in **adapters**.

* No business logic
* No orchestration
* Just communication

**Examples**

* `SmsGateway`
* `PaymentProvider`
* `ExternalBoatFeed`

Workflows use adapters, not the other way around.

---

## Decision Guide

When adding new logic, ask:

1. **Does this affect only one aggregate?**
   → Put it on the aggregate root

2. **Does this touch multiple aggregates or external systems?**
   → Create a workflow

3. **Is this triggered by HTTP, a job, or a webhook?**
   → Delegate immediately

---

## Naming Rules

Avoid generic names:

❌ `LeadService`
❌ `ProcessLead`
❌ `HandleLead`

Use business events:

✅ `CreateLead`
✅ `SendMessageToSeller`
✅ `CloseLeadAsSold`

---

## Testing

* **Aggregates**: unit tests on models
* **Workflows**: behavior tests (inputs → side effects)
* **Controllers/Jobs**: minimal tests (delegation only)

---

## Non-Goals

This architecture intentionally avoids:

* Service object frameworks
* Clean Architecture layers
* Generic base classes
* Shared “call” interfaces

If a new abstraction is needed, it must be:

* Named after a business concept
* Justified by repeated use

---

## Summary

* Aggregates own consistency
* Workflows coordinate behavior
* Entry points delegate
* Names matter more than folders

When in doubt, prefer **clarity over cleverness**.

---

If you want, next we can:

* Turn this into a **code review checklist**
* Add a **“how to refactor legacy code”** section
* Create **LLM prompts** that enforce this structure
* Walk through a real feature from your app using this guide

Just tell me where you want to go next.
