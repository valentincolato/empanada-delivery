# Clients Pattern

Clients are low-level wrappers for external services (APIs, databases, cloud providers). They live in `app/clients/` and provide a clean interface to third-party systems while remaining **domain-ignorant**.

## Core Principle

```
┌─────────────────────────────────────────────────────────────┐
│  RightBoat Universe                                         │
│                                                             │
│  Domain-aware code (Job, Action, Prompt, Integration, etc.) │
│    - Knows Lead, Boat, User, ImportTrail...                 │
│    - Maps domain objects → primitives/hashes                │
│    - Orchestrates the work                                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ uniform interface (payload hash)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Client                                                     │
│    - Domain-ignorant                                        │
│    - Accepts primitives, hashes, value objects              │
│    - Returns uniform Response                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ varied (auth, headers, signatures)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3rd Party Universe (AWS, Mongo, Gemini, Slack, etc.)       │
└─────────────────────────────────────────────────────────────┘
```

**Clients sit on the boundary between RightBoat and external systems.** They are closer to the third-party side than the RightBoat side. This means:

- Clients **never** accept domain objects (Lead, Boat, User, etc.)
- Clients **only** accept primitives, hashes, arrays, and value objects
- Domain-to-client mapping happens in the **caller**, not the client

## The Uniform Interface Contract

All instance-based clients follow the same interface pattern:

```ruby
# Construction: credentials in, client out
client = Namespace::Client.new(credentials)

# Operations: payload in, Response out
response = client.operation_name(payload)

# Response: uniform interface
response.successful?   # => bool
response.status        # => Integer
response.parsed_body   # => Hash/Array/nil
response.body          # => String (raw)
```

This creates consistency at both boundaries:

| Boundary | Interface | Uniform? |
|----------|-----------|----------|
| **Inbound to Client** | `client.operation(payload)` | ✅ Payload is always a Hash |
| **Outbound from Client** | `response.successful?`, `response.parsed_body` | ✅ Same methods on all Response objects |
| **Internal (to 3rd party)** | Auth, headers, signatures | ❌ Varies per service |

## The Three Components

Instance-based clients are composed of three parts:

```
Client   = "What can I do?"     (public interface)
Request  = "How do I talk?"     (protocol expert)
Response = "What did I get?"    (uniform result)
```

### Client

**Purpose:** Public interface for callers. Exposes operations. Holds credentials.

```ruby
module ServiceName
  class Client
    def initialize(credentials)
      @credentials = credentials
    end

    # Operations map to API endpoints
    # Each takes a payload hash, returns a Response
    def create_thing(payload)
      Request.post("/things", payload, credentials: @credentials).execute
    end

    def get_thing(id)
      Request.get("/things/#{id}", credentials: @credentials).execute
    end

    def list_things(filters = {})
      Request.get("/things", filters, credentials: @credentials).execute
    end
  end
end
```

**Responsibilities:**
- Hold credentials (pass to Request)
- Expose operations as methods
- Map operations to HTTP verbs + paths
- NOT know how to authenticate or build headers (that's Request's job)

### Request

**Purpose:** Protocol expert. Knows how to talk to this specific 3rd party.

```ruby
module ServiceName
  class Request
    BASE_URL = "https://api.servicename.com/v1"

    def self.get(path, params = {}, credentials:)
      new(method: :get, path: path, payload: params, credentials: credentials)
    end

    def self.post(path, payload, credentials:)
      new(method: :post, path: path, payload: payload, credentials: credentials)
    end

    def initialize(method:, path:, payload: nil, credentials:)
      @method = method
      @path = path
      @payload = payload
      @credentials = credentials
    end

    def execute
      http_response = HTTP.headers(headers).send(method, url, **request_options)
      Response.new(http_response)
    end

    private

    def url
      "#{BASE_URL}#{@path}"
    end

    def headers
      # All 3rd-party-specific knowledge lives here
      {
        "Authorization" => "Bearer #{@credentials.api_key}",
        "X-Signature" => compute_signature,
        "Content-Type" => "application/json"
      }
    end

    def compute_signature
      # API-specific signature logic
      OpenSSL::HMAC.hexdigest("SHA256", @credentials.secret, signing_string)
    end

    def request_options
      @method == :get ? { params: @payload } : { json: @payload }
    end
  end
end
```

**Responsibilities:**
- Know the BASE_URL
- Know how to authenticate (headers, signatures, API keys)
- Know content types and special headers the API requires
- Build complete, valid HTTP requests
- Execute HTTP and return Response
- NOT be called directly by domain code (that's Client's job)

### Response

**Purpose:** Uniform result wrapper. Same interface across ALL clients.

```ruby
module ServiceName
  class Response
    attr_reader :status, :headers, :body

    def initialize(http_response)
      @status = http_response.status.to_i
      @headers = http_response.headers.to_h
      @body = http_response.body.to_s
    end

    def successful?
      status.between?(200, 299)
    end

    def parsed_body
      @parsed_body ||= JSON.parse(body)
    rescue JSON::ParserError
      nil
    end
  end
end
```

**Responsibilities:**
- Wrap raw HTTP response
- Provide uniform interface (`successful?`, `parsed_body`, `status`)
- NOT interpret business meaning (that's the caller's job)

## Why Three Components?

| Concern | Single class | Separated |
|---------|--------------|-----------|
| Testing | Mock HTTP library | Mock at any layer |
| Auth changes | Edit client methods | Edit Request only |
| New operation | Risk breaking auth | Add method to Client |
| Debugging | Hunt through code | Inspect Request/Response objects |
| Consistency | Each client different | Response always the same |

## The Flow

```
Domain Code (Job, Action, Prompt)
       │
       │  payload hash
       ▼
┌─────────────────────────────────────────────┐
│  Client                                     │
│    - Receives payload                       │
│    - Creates Request with path + payload    │
└─────────────────────────────────────────────┘
       │
       │  creates
       ▼
┌─────────────────────────────────────────────┐
│  Request                                    │
│    - Adds auth headers, signatures          │
│    - Builds full URL                        │
│    - Executes HTTP                          │
└─────────────────────────────────────────────┘
       │
       │  HTTP
       ▼
   3rd Party API
       │
       │  HTTP response
       ▼
┌─────────────────────────────────────────────┐
│  Response                                   │
│    - Wraps HTTP response                    │
│    - Uniform interface                      │
└─────────────────────────────────────────────┘
       │
       │  returned to
       ▼
Domain Code (interprets business meaning)
```

## Two Client Styles

### Style A: Instance-based with Request/Response

For external HTTP APIs. Uses the full three-component pattern.

```ruby
# Structure
app/clients/
└── servicename/
    ├── client.rb
    ├── request.rb
    └── response.rb

# Usage
client = ServiceName::Client.new(credentials)
response = client.create_thing(payload)

if response.successful?
  response.parsed_body["id"]
else
  handle_error(response)
end
```

**Use for:** External APIs (Gemini, HubSpot, Replicate, Slack, etc.)

### Style B: Singleton-ish (Class Methods)

For infrastructure clients wrapping SDKs. Simpler pattern, no Request/Response.

```ruby
class MongoClient
  def self.client
    @client ||= Mongo::Client.new(Env.fetch(:MONGO_URL))
  end

  def self.insert_one(document, collection)
    db[collection].insert_one(document)
  end

  def self.aggregation(collection, query)
    db[collection].aggregate(query)
  end
end

# Usage - class methods, no instantiation
MongoClient.insert_one(document, "tracking")
```

**Use for:** Infrastructure wrapping SDKs (MongoDB, S3, CloudWatch)

## Domain Mapping: The Caller's Responsibility

The mapping from domain objects to payload hashes happens in the caller:

```ruby
class HubspotIntegration
  def process_lead(event)
    lead = event.resource

    # Mapping happens HERE
    payload = {
      firstname: lead.name,
      email: lead.email,
      boat_name: lead.boat&.name
    }

    # Client receives payload hash, returns uniform Response
    response = client.send_form(payload)

    # Caller interprets business meaning
    event.update!(successful: response.successful?)
  end
end
```

| Use Case | Caller (does mapping) | Client |
|----------|----------------------|--------|
| Send lead to HubSpot | `HubspotIntegration` | `Hubspot::Client` |
| Estimate boat price | `PricePrompt` | `Gemini::Client` |
| Upscale boat image | `Replicate::Upscaler` | `Replicate::Client` |
| Track user event | `MongoTrackingJob` | `MongoClient` |

## File Structure

```
app/clients/
├── mongo_client.rb           # Singleton-ish (Style B)
├── s3_client.rb              # Singleton-ish (Style B)
├── gemini/                   # Instance-based (Style A)
│   ├── client.rb
│   ├── request.rb
│   └── response.rb
├── hubspot/
│   ├── client.rb
│   ├── request.rb
│   └── response.rb
├── replicate/
│   ├── client.rb
│   ├── request.rb
│   └── response.rb
└── servicename/              # Template for new clients
    ├── client.rb
    ├── request.rb
    └── response.rb
```

## Creating a New Client

### Step 1: Create the Response (uniform interface)

```ruby
module NewService
  class Response
    attr_reader :status, :headers, :body

    def initialize(http_response)
      @status = http_response.status.to_i
      @headers = http_response.headers.to_h
      @body = http_response.body.to_s
    end

    def successful?
      status.between?(200, 299)
    end

    def parsed_body
      @parsed_body ||= JSON.parse(body)
    rescue JSON::ParserError
      nil
    end
  end
end
```

### Step 2: Create the Request (protocol expert)

```ruby
module NewService
  class Request
    BASE_URL = "https://api.newservice.com/v1"

    def self.post(path, payload, credentials:)
      new(method: :post, path: path, payload: payload, credentials: credentials)
    end

    def initialize(method:, path:, payload:, credentials:)
      @method = method
      @path = path
      @payload = payload
      @credentials = credentials
    end

    def execute
      http_response = HTTP.headers(headers).send(@method, url, json: @payload)
      Response.new(http_response)
    end

    private

    def url = "#{BASE_URL}#{@path}"

    def headers
      {
        "Authorization" => "Bearer #{@credentials.api_key}",
        "Content-Type" => "application/json"
      }
    end
  end
end
```

### Step 3: Create the Client (public interface)

```ruby
module NewService
  class Client
    def initialize(credentials)
      @credentials = credentials
    end

    def create_thing(payload)
      Request.post("/things", payload, credentials: @credentials).execute
    end

    def get_thing(id)
      Request.get("/things/#{id}", credentials: @credentials).execute
    end
  end
end
```

## Testing

```ruby
# Test Request builds correct headers/auth
describe NewService::Request do
  it "includes authorization header" do
    request = described_class.post("/test", {}, credentials: creds)
    expect(request.send(:headers)).to include("Authorization" => "Bearer #{creds.api_key}")
  end
end

# Test Client by mocking Request
describe NewService::Client do
  it "calls correct endpoint" do
    expect(NewService::Request).to receive(:post)
      .with("/things", payload, credentials: anything)
      .and_return(mock_request)

    client.create_thing(payload)
  end
end

# Test domain code by mocking Client
describe HubspotIntegration do
  it "maps lead to payload" do
    expect(client).to receive(:send_form).with(
      hash_including(firstname: lead.name, email: lead.email)
    ).and_return(successful_response)

    integration.process_lead(event)
  end
end
```

## Anti-patterns

| Anti-pattern | Problem | Fix |
|--------------|---------|-----|
| Client accepts `Lead` object | Domain coupling | Accept payload hash |
| Auth logic in Client | Mixed responsibilities | Move to Request |
| Different Response interfaces | Inconsistent for callers | Use uniform Response |
| Domain code calls Request directly | Bypasses Client interface | Always go through Client |
| Business rules in Client | Wrong layer | Move to caller |
