# FastAPI SEO/GEO Service Authentication Guide

This document outlines the authentication and rate-limiting system implemented for the AI-Agent (FastAPI) microservice. This ensures the service is secure before exposing it publicly.

## Authentication Method

The API uses **Bearer Token Authentication**. Each client must pass an active API Key in the `Authorization` header of the HTTP request.

**Header Format:**
```
Authorization: Bearer <YOUR_API_KEY>
```

**Example Request:**
```bash
curl -X POST "https://your-api-url.com/api/blog/generate" \
     -H "Authorization: Bearer my-secret-api-key" \
     -H "Content-Type: application/json" \
     -d '{"topic": "Real Estate Trends", "industry": "Real Estate"}'
```

## How It Works

A new middleware, `APIKeyAuthMiddleware`, intercepts every incoming request (except for root `/`, `/docs`, `/redoc`, and `/openapi.json`) and validates the API key against the `api_keys` table in the Supabase PostgreSQL database.

### API Keys Table Schema
To support this, an `api_keys` table was created with the following schema:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Links to `auth.users`)
- `api_key`: TEXT (Unique API Key string)
- `plan`: TEXT (Used to define rate limits: e.g., 'free', 'pro', 'premium')
- `status`: TEXT ('active', 'revoked', 'suspended')
- `created_at`: TIMESTAMP
- `expires_at`: TIMESTAMP (Optional expiration date)

*(A database migration script has been provided in `server/supabase/migrations/20260610_create_api_keys.sql`. Please apply it to the database.)*

## HTTP Response Codes

The middleware will return the following HTTP status codes based on the validation step:

- **401 Unauthorized**: 
  - Returned if the `Authorization` header is missing, incorrectly formatted, or if the provided API Key does not exist in the database.
- **403 Forbidden**: 
  - Returned if the API Key exists but its `status` is not `'active'` (e.g., `'revoked'`, `'suspended'`).
  - Returned if the current time has passed the key's `expires_at` date.
- **429 Too Many Requests (Rate Limited)**:
  - Returned if the client exceeds the allowed request rate for their plan.

## Rate Limiting

An in-memory rate limiter tracks request frequency per API Key using a sliding 60-second window. The limits dynamically adjust based on the `plan` associated with the API Key:

- **Free Plan**: 10 requests per minute
- **Pro Plan**: 30 requests per minute
- **Premium Plan**: 60 requests per minute

## Credit Deduction & Dashboard Billing

When an external client generates content using an API Key, the system automatically hooks into the central credit ledger:
1. **Pre-flight Check**: The system validates if the user has sufficient credits in their `user_credits` table. If not, the API returns `402 Payment Required`.
2. **Auto-Saving**: The generated article is automatically saved to the user's dashboard (in a draft state).
3. **Credit Deduction**: The `deduct_credits_with_ledger` PostgreSQL RPC is called, deducting exactly 1 credit per successful blog generation.

This ensures all API usage draws directly from the user's purchased balance and is visible on their Bitlance dashboard.

## Implementation Details
- The middleware queries Supabase using the `SUPABASE_SERVICE_ROLE_KEY` to retrieve the key securely without bypassing RLS if needed, although RLS policies enforce access.
- The middleware supports **BOTH** external API keys and internal JWT tokens (for the Node.js frontend), ensuring the platform architecture remains unbroken.
- Once authenticated, the middleware attaches `user_id` and `auth_type` to the `request.state`.
- The internal endpoints, such as the `generate_blog` route, have been refactored to conditionally deduct credits only if `auth_type == 'api_key'`.
