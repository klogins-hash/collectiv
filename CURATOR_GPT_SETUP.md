# Collectiv Curator Custom GPT Setup Guide

## Overview
The **Collectiv Curator** is a specialized ChatGPT custom GPT that acts as your AI-powered wiki curation assistant. It analyzes your entire wiki knowledge base, understands your vision and values, and helps maintain coherence across all documentation when you make policy or direction changes.

---

## 🎯 What It Does

The Curator GPT:
- **Reads your wiki** - Accesses all articles, categories, tags, and relationships
- **Understands your vision** - Learns from system prompts what you care about
- **Analyzes coherence** - Finds inconsistencies, broken links, contradictions
- **Proposes changes** - Suggests how to update documentation when policies change
- **Executes updates** - Applies changes with full audit trails
- **Maintains relationships** - Updates cross-references automatically
- **Tracks history** - WORM database preserves all versions

---

## 📋 Custom GPT System Prompt

Copy this into your ChatGPT custom GPT "Instructions":

```
You are the Collectiv Curator, an AI assistant specialized in maintaining coherence and consistency across a wiki knowledge base. Your role is to help the user keep their documentation aligned with their vision, values, and current strategy.

## Your Primary Responsibilities

1. **Understand the User's Vision**
   - You are building a world-class, AI-optimized knowledge base called Collectiv
   - The wiki is designed for AI agents and RAG systems (optimized with JSON-LD)
   - Content is atomic (40-60 word chunks), searchable, and AI-consumable
   - E-E-A-T signals (Expertise, Authoritativeness, Experience, Trustworthiness) are paramount

2. **Analyze Wiki Coherence**
   - When asked to check the wiki, call the /consistency-check endpoint
   - Report back on: tag consistency, broken links, contradictions, orphaned content, style issues
   - Prioritize critical issues (broken contradictions, outdated info)

3. **Handle Natural Language Requests**
   - You receive ADHD-style, conversational requests from the user
   - You parse their intent: policy changes, direction shifts, content updates
   - You clarify ambiguities by asking focused questions
   - You think strategically about what ALL articles might be affected

4. **Propose Changes Intelligently**
   - Call /wiki-context to get current state
   - Analyze the change impact across relationships
   - Call /propose-changes with your detailed analysis
   - Show the user: what changes, why each one, potential side effects
   - Create proposals that are coherent and complete

5. **Execute with User Approval**
   - NEVER execute changes without explicit user approval
   - Show impact analysis before asking for approval
   - Get user's blessing for each major change
   - After approval, call /bulk-update with detailed reasoning
   - Report back on what changed and why

## Interaction Flow

**User**: "We're focusing on enterprise only now, not startups"
**You**:
  1. Call /consistency-check to understand current state
  2. Call /wiki-context to see which articles mention startups
  3. Analyze impact: "Found 12 articles, 34 broken links if we pivot"
  4. Call /propose-changes with plan:
     - Deprecate 3 startup-focused articles
     - Update 8 enterprise articles to remove startup comparisons
     - Create 1 new enterprise focus article
     - Update tags on 5 articles
  5. Present analysis to user
  6. If approved, call /bulk-update
  7. Report: "✅ Changes complete. Coherence improved from 0.88 → 0.94"

## Your Knowledge About Collectiv

**Technology Stack**:
- Next.js 15 + TypeScript backend
- PostgreSQL + Prisma ORM
- Redis caching
- Docker deployment

**Content Standards**:
- 40-60 word atomic answers
- Answer-first format (summary after H1)
- JSON-LD schema markup
- E-E-A-T confidence scores
- llms.txt protocol compliance

**Wiki Structure**:
- Articles have categories, tags, relationships
- Cross-linking is critical for coherence
- No broken links allowed
- Consistent terminology across all content

## Safety & Boundaries

- Always require user approval before executing changes
- Show impact analysis transparently
- Never silently modify existing articles without warning
- Flag contradictions rather than choosing sides
- Suggest resolutions but defer to user judgment
- Maintain full audit trail of who approved what

## When User Asks "Is the wiki coherent?"

1. Call /consistency-check endpoint
2. Analyze the response holistically
3. Group issues by severity
4. Propose interventions in priority order
5. Offer to run curation if coherence < 0.85
6. Show before/after scores when done

## Remember

- You're not just a tool, you're the user's strategic partner
- Think about user's long-term vision, not just tactical changes
- Ask clarifying questions when intent is ambiguous
- Proactively suggest improvements (don't just react)
- Be conversational and clear in explanations
- Always explain WHY you're proposing changes
```

---

## 🔌 OpenAI Actions Configuration

### Step 1: Create Custom GPT

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click "Create" → "Create a new GPT"
3. Name: **"Collectiv Curator"**
4. Description: "AI-powered wiki curation assistant that maintains coherence across your knowledge base"
5. Paste the System Prompt from above into "Instructions"

### Step 2: Add Actions (APIs)

In the Custom GPT editor, go to "Actions" → "Create new action"

#### Action 1: Get Wiki Context

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Collectiv Wiki Context API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-collectiv-domain.com"
    }
  ],
  "paths": {
    "/api/curator/wiki-context": {
      "get": {
        "summary": "Get full wiki context for analysis",
        "description": "Returns all articles, categories, tags, and relationships for impact analysis",
        "operationId": "getWikiContext",
        "responses": {
          "200": {
            "description": "Full wiki context",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "context": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Action 2: Propose Changes

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Collectiv Propose Changes API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-collectiv-domain.com"
    }
  ],
  "paths": {
    "/api/curator/propose-changes": {
      "post": {
        "summary": "Propose changes with impact analysis",
        "description": "GPT proposes changes and gets impact analysis before user approval",
        "operationId": "proposeChanges",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "conversationContext": {
                    "type": "string",
                    "description": "What the user asked for"
                  },
                  "proposedChanges": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "articleId": { "type": "string" },
                        "action": {
                          "type": "string",
                          "enum": [
                            "update",
                            "deprecate",
                            "create",
                            "merge",
                            "archive",
                            "delete"
                          ]
                        },
                        "reason": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Proposed changes with impact analysis"
          }
        }
      }
    }
  }
}
```

#### Action 3: Bulk Update

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Collectiv Bulk Update API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-collectiv-domain.com"
    }
  ],
  "paths": {
    "/api/curator/bulk-update": {
      "post": {
        "summary": "Execute approved changes",
        "description": "Applies approved changes to wiki and creates audit trail",
        "operationId": "bulkUpdate",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "conversationId": {
                    "type": "string",
                    "description": "Links to GPT conversation"
                  },
                  "changes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "articleId": { "type": "string" },
                        "action": {
                          "type": "string"
                        },
                        "content": { "type": "string" }
                      }
                    }
                  },
                  "userApproval": {
                    "type": "boolean",
                    "description": "Must be true to execute"
                  },
                  "approvalNotes": { "type": "string" }
                },
                "required": ["conversationId", "changes", "userApproval"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Changes successfully executed"
          }
        }
      }
    }
  }
}
```

#### Action 4: Consistency Check

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Collectiv Consistency Check API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-collectiv-domain.com"
    }
  ],
  "paths": {
    "/api/curator/consistency-check": {
      "post": {
        "summary": "Check wiki coherence",
        "description": "Analyzes wiki for consistency issues and generates improvement suggestions",
        "operationId": "consistencyCheck",
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "fullWikiAnalysis": {
                    "type": "boolean",
                    "default": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Consistency analysis results"
          }
        }
      }
    }
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Policy Change

**You**: "Hey, we're pivoting to enterprise focus. Remove all startup content and make sure everything emphasizes scalability and security."

**Curator**:
1. Analyzes current wiki
2. Finds 15 articles affected
3. Proposes: deprecate 3, update 9, enhance 3
4. Shows impact on relationships
5. Gets your approval
6. Executes and reports: "✅ Done! Updated 9 articles, deprecated 3, relationships resolved"

### Example 2: Coherence Check

**You**: "Is the wiki quality okay right now?"

**Curator**:
1. Runs full consistency check
2. Reports: "Found 3 critical issues, 5 high priority, 12 low priority. Coherence: 0.88"
3. Lists issues: contradictions between cost articles, outdated 2025 data, broken RAG link
4. Suggests: "Want me to run curation? Should take ~3 edits"

### Example 3: Catch-All with ADHD-Friendly Language

**You**: "ok so we got feedback that like the enterprise stuff needs way more detail about implementation, we want hands-on people to actually be able to use this for real-world stuff, not just theory"

**Curator**:
1. Parses intent: "Add practical implementation guidance"
2. Asks: "Should I focus on existing Enterprise articles or create new ones? Any specific areas (deployment, ops, troubleshooting)?"
3. Once clarified, proposes enhancing 6 enterprise articles with implementation sections
4. Gets approval and updates

---

## 🔐 Security Notes

- **API Key**: Store your Collectiv API key securely in ChatGPT settings
- **Rate Limiting**: APIs enforce 100 req/min per IP
- **Approval Required**: All changes require explicit user approval (no auto-execute)
- **Audit Trail**: Every change logged with conversation ID
- **WORM Safety**: Original versions preserved (can revert anytime)

---

## ⚙️ Configuration

### Set Your Domain

Replace `https://your-collectiv-domain.com` with your actual Collectiv instance URL:
- Local: `http://localhost:3000`
- Production: `https://collectiv.yourcompany.com`
- Railway: `https://collectiv-{deployment-id}.railway.app`

### Authentication

If you add auth to your APIs, configure in ChatGPT:
1. Actions → "Authentication"
2. Choose "OAuth 2.0" or "API Key"
3. Add your Collectiv API credentials

---

## 📊 Expected Workflows

### Daily Curation
```
Morning check → "Consistency check" → View issues → Ask Curator for suggestions → Approve → Done
```

### Policy Changes
```
New policy announcement → Explain to Curator → Review proposals → Approve → Execute →  Verify
```

### Content Expansion
```
"Add more about X" → Curator analyzes → Proposes additions → Review locations →Approve → Update
```

### Emergency Fixes
```
"Found mistake in Y articles" → Describe issue → Curator finds all related → Proposes fixes → Approve → Fix all
```

---

## 🎓 Tips for Best Results

1. **Be Specific But Conversational** - You don't need perfect English. "enterprise focus" works great.
2. **Ask It to Clarify** - If the Curator asks questions, that means it's being thoughtful.
3. **Review Proposals** - Always check the proposed changes before approving.
4. **Use Coherence Reports** - Run consistency checks weekly to catch drift.
5. **Trust the Impact Analysis** - Curator shows broken links/cascade effects better than humans.
6. **Version Everything** - Nothing is final. All changes create new versions for reverting.

---

## 🆘 Troubleshooting

**"Curator can't access my wiki"**
- Check URL in Actions is correct
- Verify API endpoints are responding (test with curl)
- Check API authentication if configured

**"Changes aren't showing up"**
- Check that you selected "Yes" to approve
- Look for "userApproval: true" in the request
- Check database logs for errors

**"Coherence score isn't improving"**
- Run consistency-check again to see what changed
- Curator might be fixing one issue and revealing others
- More articles = more edge cases (normal!)

---

## 📞 Support

For issues with the Curator GPT:
- Check the API logs in Collectiv backend
- Verify your OpenAI Action JSON is correct
- Test API endpoints manually with curl
- Check that database migrations ran successfully

---

**Version**: v0.84.0 (January 7, 2026)
**Last Updated**: Curator GPT system ready for first deployment
