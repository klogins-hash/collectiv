# Supabase Integration Guide for Collectiv

## Overview

In 2026, Supabase is considered an excellent middle-ground—significantly easier than building a custom Flask/Node.js backend from scratch, but requiring more setup than a dedicated no-code platform like CustomGPT.ai.

Since you know how to "vibe code" in VS Code, Supabase plays to your strengths by providing a structured, pre-built backend that handles the heavy lifting of security and database management.

## Why Supabase is Perfect for Collectiv

### 1. Built-in OAuth 2.1 Server
As of late 2025/early 2026, Supabase has a native OAuth 2.1 server capability. You can register your Custom GPT as an "OAuth App" directly in the Supabase dashboard, which generates the Client ID and Client Secret you need for OpenAI.

**Benefits:**
- No need for manual OAuth implementation
- Seamless integration with Custom GPT
- Automated token refreshes and security

### 2. Row Level Security (RLS)
Instead of writing complex backend logic to check subscription status, you can use RLS policies. You can write a single SQL rule that only allows data access if the user's `subscription_status` in your database is `'active'`.

**Example RLS Policy:**
```sql
-- Only allows access to articles if user has active subscription
CREATE POLICY "active_subscription_only"
ON articles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE subscription_status = 'active'
  )
);
```

### 3. Edge Functions for Stripe Integration
You can use Supabase Edge Functions (written in TypeScript) to handle Stripe webhooks. When a member pays, the function automatically updates their status in your database, which instantly gates or opens their access to the Custom GPT.

**Edge Function Example:**
```typescript
// supabase/functions/handle-stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const payload = await req.json()
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  )

  if (payload.type === "customer.subscription.created" ||
      payload.type === "customer.subscription.updated") {
    await supabase
      .from("users")
      .update({ subscription_status: "active" })
      .eq("stripe_customer_id", payload.data.object.customer)
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
```

### 4. VS Code Integration
Supabase has deep integration with VS Code through its CLI and the Deno language server, allowing you to develop, test, and deploy your entire auth flow without leaving your editor.

**Setup:**
```bash
npm install -g supabase
supabase link --project-ref your_project_id
supabase functions new handle-stripe-webhook
```

## The "Hard" Parts (Where You'll Need to Code)

### 1. Authorization UI
While Supabase provides the backend, you still need to build a simple "Consent Screen" (e.g., a page that says "Allow this GPT to access your account?").

**Implementation in Next.js:**
```tsx
// app/auth/consent/page.tsx
'use client'

export default function ConsentScreen() {
  const handleApprove = async () => {
    // Redirect back to Custom GPT with approval
    window.location.href = `${process.env.NEXT_PUBLIC_CUSTOM_GPT_REDIRECT}?approved=true`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Allow Collectiv GPT Access?</h1>
      <p className="mb-8">This Custom GPT needs permission to access your personal knowledge base.</p>
      <button
        onClick={handleApprove}
        className="px-6 py-2 bg-blue-500 text-white rounded"
      >
        Approve
      </button>
    </div>
  )
}
```

### 2. The Check-Access Action
You will need to create at least one Custom Action in your GPT that calls a Supabase Edge Function to verify the user is a current "paid member" for that month before providing any data or high-value responses.

**Edge Function for Access Check:**
```typescript
// supabase/functions/check-member-access/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { user_id } = await req.json()

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  )

  const { data: user, error } = await supabase
    .from("users")
    .select("subscription_status, subscription_end")
    .eq("id", user_id)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ access: false, reason: "user_not_found" }),
      { status: 404 }
    )
  }

  const isActive = user.subscription_status === "active" &&
                   new Date(user.subscription_end) > new Date()

  return new Response(
    JSON.stringify({
      access: isActive,
      subscription_end: user.subscription_end
    }),
    { status: 200 }
  )
})
```

## Implementation Steps for Collectiv

### Step 1: Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Create new project
supabase projects create --name collectiv

# Link to your Next.js app
supabase link --project-ref your_project_ref
```

### Step 2: Database Schema
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free',
  subscription_end TIMESTAMP,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- RLS Policy for subscription access
CREATE POLICY "subscription_access"
ON articles FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT id FROM users WHERE subscription_status = 'active'
  )
);
```

### Step 3: Set Up OAuth App
1. Go to Supabase Dashboard → Authentication → OAuth Providers
2. Enable "OAuth Apps" section
3. Create new OAuth App for Collectiv Custom GPT
4. Copy Client ID and Client Secret
5. Register in OpenAI Custom GPT settings

### Step 4: Deploy Edge Functions
```bash
# Create Stripe webhook handler
supabase functions new stripe-webhook
supabase functions deploy stripe-webhook

# Create member access check
supabase functions new check-member-access
supabase functions deploy check-member-access
```

### Step 5: Configure Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_CUSTOM_GPT_REDIRECT=https://your-gpt-callback-url
```

## Comparison: Supabase vs Alternatives

| Feature | Supabase (VS Code) | Bubble (No-Code) | Custom Backend (Flask/Node) |
|---------|-------------------|------------------|---------------------------|
| Setup Speed | Fast (pre-built Auth/DB) | Very Fast | Slow |
| OAuth Ease | Native server support | Plugin-dependent | Manual implementation |
| Scalability | High (Postgres) | Medium (WU costs) | Infinite |
| "Vibe" Fit | High (Deno/TS/SQL) | Low (Visual clicks) | High (Full control) |
| Cost | Free tier generous | $10-100/mo | Variable |
| Learning Curve | Medium (SQL + Auth) | Low (Visual) | High |

## Verdict

**If you are comfortable in VS Code, use Supabase.** It provides the most professional "members-only" infrastructure with the least amount of "boilerplate" code, especially with the 2026 updates to their OAuth Server features.

## Next Steps

1. Create Supabase project
2. Set up database schema
3. Configure OAuth app in Supabase
4. Create Edge Functions for auth and webhooks
5. Integrate with Custom GPT via OpenAI Actions
6. Test subscription flow with Stripe
7. Deploy Edge Functions to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OAuth 2.1 in Supabase](https://supabase.com/docs/guides/auth/oauth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase + VS Code CLI](https://supabase.com/docs/guides/cli)
