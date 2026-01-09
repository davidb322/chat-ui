# Test Coverage Analysis

## Executive Summary

The codebase has **minimal test coverage** with only 12 test files covering approximately 5% of the codebase. While the existing tests follow good patterns (MongoDB memory server, proper mocking, clean assertions), significant gaps exist in critical areas including authentication, API routes, and UI components.

## Current State

### Testing Infrastructure
- **Framework**: Vitest v3.1.4
- **Environments**: Browser (Playwright/Chromium) + Node.js
- **Database**: MongoDB Memory Server for integration tests
- **Configuration**: Multi-workspace setup in `vite.config.ts`

### Coverage Statistics
| Category | Total | Tested | Coverage |
|----------|-------|--------|----------|
| TypeScript files | ~239 | ~15 | ~6% |
| Svelte components | 62 | 1 | 1.6% |
| API routes | 50+ | 1 | ~2% |
| Stores | 7 | 0 | 0% |

### Currently Tested Areas
1. **Tree/Conversation Utilities** (6 test files) - Message tree manipulation, legacy conversion
2. **Database Migrations** (2 test files) - Migration locking, conversation cleanup
3. **Authentication Callbacks** (1 test file) - User creation/update on login
4. **URL Validation** (1 test file) - Local URL detection
5. **Template Engine** (1 test file) - Handlebars/Jinja compilation
6. **Markdown Renderer** (1 test file) - Component rendering

---

## Priority Areas for Test Coverage Improvement

### Priority 1: Security-Critical (HIGH RISK)

#### 1.1 Authentication & Authorization (`src/lib/server/auth.ts`)
**Risk**: Security vulnerabilities, session hijacking, unauthorized access

**Functions needing tests:**
```typescript
// CSRF token generation and validation
generateCsrfToken(sessionId, redirectUrl) // Line 97-109
validateAndParseCsrfToken(token, sessionId) // Line 158-185

// Session authentication
authenticateRequest(headers, cookie, isApi) // Line 194-313
findUser(sessionId) // Line 75-83
authCondition(locals) // Line 84-92

// Cookie management
refreshSessionCookie(cookies, sessionId) // Line 64-73
```

**Suggested test cases:**
- CSRF token validation with expired tokens
- CSRF token validation with tampered signatures
- Session lookup with valid/invalid sessionIds
- Bearer token authentication flow
- Trusted email header authentication
- Session collision handling
- Admin status checks

#### 1.2 Admin Token Management (`src/lib/server/adminToken.ts`)
**Risk**: Privilege escalation, unauthorized admin access

**Suggested test cases:**
- Token rotation after each use
- Session binding verification
- Expired token rejection
- Concurrent session handling

#### 1.3 File Access Control (`src/lib/server/files/`)
**Risk**: Unauthorized file access, data leakage

**Files:**
- `uploadFile.ts` (Line 7-29)
- `downloadFile.ts` (Line 7-34)

**Suggested test cases:**
- File upload with SHA256 hash generation
- MIME type detection fallback
- Upload timeout handling (20s limit)
- Download authorization (conversation ownership check at line 17-19)
- 404 handling for missing files
- 403 handling for unauthorized access

---

### Priority 2: Core Business Logic (MEDIUM-HIGH RISK)

#### 2.1 Conversation API Routes (`src/routes/api/conversations/+server.ts`)
**Risk**: Data integrity, authorization bypass

**Functions needing tests:**
- `GET /api/conversations` - Pagination logic, auth enforcement
- `DELETE /api/conversations` - Bulk delete authorization

**Suggested test cases:**
- Pagination with different page numbers
- Empty results handling
- Authorization enforcement (sessionId vs userId)
- Model lookup for tools field
- Bulk delete only affects user's conversations

#### 2.2 Message Processing (`src/lib/server/endpoints/preprocessMessages.ts`)
**Risk**: Data corruption, injection vulnerabilities

**Functions needing tests:**
- File downloading and injection
- Web search context formatting
- Clipboard file handling
- MIME type transformations

#### 2.3 Text Generation Pipeline (`src/lib/server/textGeneration/`)
**Risk**: Generation failures, tool execution errors

**Files:**
- `index.ts` - Main generation orchestration
- `tools.ts` - Tool execution and parsing
- `generate.ts` - Stream handling

**Suggested test cases:**
- Tool call parsing from model output (`externalToToolCall`)
- Tool execution with error handling
- Generation context building
- Web search integration
- Assistant context loading

#### 2.4 Web Search (`src/lib/server/websearch/runWebSearch.ts`)
**Risk**: External service failures, rate limiting

**Suggested test cases:**
- Search query generation
- Page scraping limits (MAX_N_PAGES_TO_SCRAPE = 8)
- Embedding page limits (MAX_N_PAGES_TO_EMBED = 5)
- HTML to markdown conversion
- Error handling for unreachable pages

---

### Priority 3: API Routes (MEDIUM RISK)

#### 3.1 Conversation CRUD
**Files:**
- `src/routes/api/conversation/[id]/+server.ts`
- `src/routes/api/conversation/[id]/message/[messageId]/+server.ts`
- `src/routes/conversation/+server.ts`

**Suggested test cases:**
- Single conversation retrieval with auth
- Message deletion with tree integrity
- Conversation creation with model validation
- Usage limit enforcement
- Shared conversation import

#### 3.2 Assistant Management
**Files:**
- `src/routes/api/assistant/+server.ts`
- `src/routes/api/assistant/[id]/+server.ts`
- `src/routes/api/assistant/utils.ts`

**Suggested test cases:**
- Assistant creation with avatar upload
- Assistant update authorization (createdById check)
- Schema validation (Zod schemas)
- RAG URL validation
- Tool ID resolution from database

#### 3.3 User Management
**Files:**
- `src/routes/api/user/validate-token/+server.ts`
- `src/routes/settings/+server.ts`

**Suggested test cases:**
- Admin token validation and rotation
- Settings persistence
- Settings migration

---

### Priority 4: UI Components (MEDIUM RISK)

#### 4.1 High-Impact Chat Components
**Files:**
- `src/lib/components/chat/ChatWindow.svelte`
- `src/lib/components/chat/ChatMessage.svelte`
- `src/lib/components/chat/ChatInput.svelte`
- `src/lib/components/chat/FileDropzone.svelte`

**Suggested test cases:**
- Message rendering with different types (text, code, tool)
- File drag-and-drop handling
- Input validation and submission
- Tool update visualization
- Vote/feedback interactions

#### 4.2 Form Components
**Files:**
- `src/lib/components/AssistantSettings.svelte`
- `src/lib/components/AssistantToolPicker.svelte`
- `src/lib/components/SystemPromptModal.svelte`

**Suggested test cases:**
- Form validation
- Tool selection logic
- Modal interactions

---

### Priority 5: State Management (LOW-MEDIUM RISK)

#### 5.1 Settings Store (`src/lib/stores/settings.ts`)
**Suggested test cases:**
- Async persistence to `/settings` endpoint
- `instantSet` method behavior
- Default value handling
- Cache invalidation

#### 5.2 Other Stores
**Files:**
- `src/lib/stores/pendingMessage.ts`
- `src/lib/stores/isAborted.ts`
- `src/lib/stores/errors.ts`

---

## Recommended Test Patterns

### Example: Auth Function Tests
```typescript
// src/lib/server/auth.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateCsrfToken, validateAndParseCsrfToken } from "./auth";
import { collections } from "$lib/server/database";

describe("CSRF Token", () => {
  const sessionId = "test-session-123";
  const redirectUrl = "http://localhost:5173/login/callback";

  it("should generate valid CSRF token", async () => {
    const token = await generateCsrfToken(sessionId, redirectUrl);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });

  it("should validate token with correct sessionId", async () => {
    const token = await generateCsrfToken(sessionId, redirectUrl);
    const decoded = Buffer.from(token, "base64").toString();
    const result = await validateAndParseCsrfToken(decoded, sessionId);
    expect(result).toEqual({ redirectUrl });
  });

  it("should reject token with wrong sessionId", async () => {
    const token = await generateCsrfToken(sessionId, redirectUrl);
    const decoded = Buffer.from(token, "base64").toString();
    const result = await validateAndParseCsrfToken(decoded, "wrong-session");
    expect(result).toBeNull();
  });

  it("should reject expired token", async () => {
    vi.useFakeTimers();
    const token = await generateCsrfToken(sessionId, redirectUrl);
    const decoded = Buffer.from(token, "base64").toString();

    // Advance time past expiration (1 hour)
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    const result = await validateAndParseCsrfToken(decoded, sessionId);
    expect(result).toBeNull();
    vi.useRealTimers();
  });
});
```

### Example: File Operations Tests
```typescript
// src/lib/server/files/downloadFile.spec.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { downloadFile } from "./downloadFile";
import { collections } from "$lib/server/database";
import { ObjectId } from "mongodb";

describe("downloadFile", () => {
  const convId = new ObjectId();
  const sha256 = "abc123hash";

  beforeEach(async () => {
    // Setup: upload a test file to GridFS
    const uploadStream = collections.bucket.openUploadStream(`${convId}-${sha256}`, {
      metadata: { conversation: convId.toString(), mime: "text/plain" },
    });
    uploadStream.write(Buffer.from("test content"));
    uploadStream.end();
    await new Promise((resolve) => uploadStream.once("finish", resolve));
  });

  afterEach(async () => {
    // Cleanup
    const files = await collections.bucket.find({}).toArray();
    for (const file of files) {
      await collections.bucket.delete(file._id);
    }
  });

  it("should download file with correct conversation ID", async () => {
    const result = await downloadFile(sha256, convId);
    expect(result.type).toBe("base64");
    expect(result.mime).toBe("text/plain");
  });

  it("should throw 403 for wrong conversation ID", async () => {
    const wrongConvId = new ObjectId();
    await expect(downloadFile(sha256, wrongConvId)).rejects.toThrow();
  });

  it("should throw 404 for non-existent file", async () => {
    await expect(downloadFile("nonexistent", convId)).rejects.toThrow();
  });
});
```

### Example: API Route Tests
```typescript
// src/routes/api/conversations/server.spec.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET, DELETE } from "./+server";
import { collections } from "$lib/server/database";
import { ObjectId } from "mongodb";

describe("GET /api/conversations", () => {
  const sessionId = "test-session";

  beforeEach(async () => {
    // Insert test conversations
    await collections.conversations.insertMany([
      { _id: new ObjectId(), title: "Conv 1", sessionId, updatedAt: new Date() },
      { _id: new ObjectId(), title: "Conv 2", sessionId, updatedAt: new Date() },
    ]);
  });

  afterEach(async () => {
    await collections.conversations.deleteMany({ sessionId });
  });

  it("should return conversations for authenticated user", async () => {
    const response = await GET({
      locals: { sessionId },
      url: new URL("http://localhost/api/conversations"),
    });

    const data = await response.json();
    expect(data).toHaveLength(2);
  });

  it("should return 401 for unauthenticated request", async () => {
    const response = await GET({
      locals: {},
      url: new URL("http://localhost/api/conversations"),
    });

    expect(response.status).toBe(401);
  });

  it("should paginate results correctly", async () => {
    const response = await GET({
      locals: { sessionId },
      url: new URL("http://localhost/api/conversations?p=1"),
    });

    const data = await response.json();
    expect(data).toHaveLength(0); // Page 1 should be empty with only 2 items
  });
});
```

---

## Implementation Roadmap

### Phase 1: Security Foundation (Week 1-2)
1. Add tests for `auth.ts` - CSRF, session handling
2. Add tests for `adminToken.ts` - Token rotation
3. Add tests for file upload/download access control
4. Add tests for conversation authorization

### Phase 2: Core API Routes (Week 3-4)
1. Conversation CRUD endpoints
2. Assistant management endpoints
3. Message operations endpoints
4. Settings endpoints

### Phase 3: Business Logic (Week 5-6)
1. Text generation pipeline
2. Tool execution
3. Web search functionality
4. Message preprocessing

### Phase 4: UI & State (Week 7-8)
1. Critical Svelte components
2. Settings store
3. Form validation components

---

## Configuration Recommendations

### Add Coverage Reporting
Update `vite.config.ts` to include coverage configuration:

```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/**',
      '**/*.d.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
    ],
    thresholds: {
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
}
```

### Add Test Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch"
  }
}
```

---

## Conclusion

The most critical gaps are in authentication/authorization and API route testing. Starting with security-critical functions will provide the highest ROI for test coverage investment. The existing test patterns in the codebase are solid and should be followed for consistency.

Key priorities:
1. **Authentication functions** - Prevent security vulnerabilities
2. **File access control** - Prevent data leakage
3. **API authorization** - Ensure proper access controls
4. **Text generation** - Ensure reliability of core feature
