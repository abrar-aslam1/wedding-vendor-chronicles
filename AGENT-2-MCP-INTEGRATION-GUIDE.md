# 🤖 Agent 2: MCP Server Integration

**Role**: MCP connectivity specialist  
**Duration**: 1-2 hours  
**Status**: 🟡 In Progress  
**Dependencies**: Agent 1 complete ✅

---

## 📋 Overview

This agent handles the connection between your system and Apify via the Model Context Protocol (MCP) server. You'll configure the Apify MCP server, test actor connectivity, and validate the enrichment workflow.

---

## ✅ Tasks Checklist

### Phase 2.1: MCP Server Setup
- [ ] Install/configure Apify MCP server
- [ ] Add Apify credentials to MCP settings
- [ ] Test MCP server connection
- [ ] Verify server is running

### Phase 2.2: Actor Testing
- [ ] Test Instagram Profile Scraper actor
- [ ] Test Search Actors discovery
- [ ] Validate data format
- [ ] Check rate limiting

### Phase 2.3: Test Scripts
- [ ] Create MCP connection test
- [ ] Create actor invocation test
- [ ] Create profile enrichment test
- [ ] Create error handling tests

### Phase 2.4: Documentation
- [ ] Document MCP configuration
- [ ] Create troubleshooting guide
- [ ] Document actor parameters
- [ ] Update master tracker

---

## 🔧 Step-by-Step Instructions

### Step 1: Understanding MCP Integration

**What is MCP?**
Model Context Protocol (MCP) is a standardized way to connect tools and services. In your case, it connects your Instagram collection system to Apify actors.

**Your MCP Setup:**
- **Server**: `github.com/apify/actors-mcp-server`
- **Actors Used**:
  1. `apify/instagram-profile-scraper` - Enriches profiles
  2. `search-actors` - Discovers usernames

**How It Works:**
```
Your Code → MCP Server → Apify API → Instagram Data
```

---

### Step 2: Configure MCP Server

#### Option A: Using Cline/Claude MCP Settings

If you're using Cline or Claude Dev, the MCP server is configured via settings:

1. **Open MCP Settings**
   - In VS Code: Command Palette → "Cline: Open MCP Settings"
   - Or edit: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. **Add Apify MCP Server**
   ```json
   {
     "mcpServers": {
       "apify": {
         "command": "npx",
         "args": ["-y", "@apify/mcp-server-apify"],
         "env": {
           "APIFY_API_TOKEN": "your_apify_token_here"
         }
       }
     }
   }
   ```

3. **Save and Reload**
   - Save the settings file
   - Reload VS Code or restart Cline

#### Option B: Manual MCP Server Setup

If not using Cline, you can run the MCP server manually:

```bash
# Install globally
npm install -g @apify/mcp-server-apify

# Or use npx (no installation needed)
npx @apify/mcp-server-apify
```

**Set Environment Variable:**
```bash
export APIFY_API_TOKEN="your_token_here"
```

---

### Step 3: Test MCP Connection

Run the connection test script:

```bash
node scripts/test-apify-mcp-connection.js
```

**Expected Output:**
```
🔌 Testing Apify MCP Connection
================================

✅ MCP server accessible
✅ Apify authentication successful
✅ Can list available actors
✅ Instagram scraper actor available

Connection test PASSED!
```

**Troubleshooting:**
- ❌ "MCP server not found" → Check MCP settings
- ❌ "Authentication failed" → Verify APIFY_API_TOKEN
- ❌ "Actor not available" → Check Apify account status

---

### Step 4: Test Instagram Profile Scraper

Run the Instagram actor test:

```bash
node scripts/test-instagram-actor.js
```

This will:
1. Call the `apify/instagram-profile-scraper` actor
2. Fetch data for a test Instagram profile
3. Validate the response format
4. Check for required fields

**Test Profile Used**: `@instagram` (Instagram's official account)

**Expected Data Structure:**
```json
{
  "username": "instagram",
  "fullName": "Instagram",
  "followersCount": 677000000,
  "followingCount": 93,
  "postsCount": 7500,
  "biography": "Discover what's new on Instagram...",
  "isVerified": true,
  "isBusinessAccount": true,
  "profilePicUrl": "https://...",
  "externalUrl": "https://about.instagram.com"
}
```

---

### Step 5: Test Profile Enrichment Workflow

Run the full enrichment test:

```bash
node scripts/test-profile-enrichment.js
```

This tests:
1. Searching for Instagram usernames (discovery)
2. Enriching profiles with actor data
3. Transforming data for database
4. Validating quality scores

**Test Cases:**
- Valid profile with full data
- Profile with missing fields
- Private account handling
- Rate limit handling

---

## 📊 MCP Server Configuration Reference

### Apify MCP Server Tools

#### 1. `call-actor`
Invokes an Apify actor with input parameters.

**Usage:**
```javascript
{
  tool: "call-actor",
  arguments: {
    actor: "apify/instagram-profile-scraper",
    input: {
      usernames: ["username1", "username2"],
      resultsType: "details"
    }
  }
}
```

**Parameters:**
- `actor` - Actor ID (e.g., `apify/instagram-profile-scraper`)
- `input` - Actor-specific input object
- `build` - (optional) Specific actor build
- `memory` - (optional) Memory allocation in MB
- `timeout` - (optional) Max runtime in seconds

#### 2. `search-actors`
Searches Apify store for actors.

**Usage:**
```javascript
{
  tool: "search-actors",
  arguments: {
    search: "instagram scraper",
    limit: 10
  }
}
```

#### 3. `get-actor`
Gets details about a specific actor.

**Usage:**
```javascript
{
  tool: "get-actor",
  arguments: {
    actorId: "apify/instagram-profile-scraper"
  }
}
```

---

## 🎯 Instagram Profile Scraper Configuration

### Actor: `apify/instagram-profile-scraper`

**Input Parameters:**

```javascript
{
  // Required
  "usernames": ["user1", "user2"],  // Or direct URLs
  
  // Optional
  "resultsType": "details",         // "details" or "posts"
  "resultsLimit": 100,              // Max results
  "addParentData": false,           // Include parent post data
  
  // Performance
  "maxRequestRetries": 3,           // Retry failed requests
  "proxyConfiguration": {
    "useApifyProxy": true
  }
}
```

**Output Fields:**
- `username` - Instagram handle
- `fullName` - Display name
- `followersCount` - Follower count
- `followingCount` - Following count
- `postsCount` - Number of posts
- `biography` - Profile bio
- `isVerified` - Blue checkmark
- `isBusinessAccount` - Business account status
- `isPrivate` - Private account
- `profilePicUrl` - Profile picture URL
- `externalUrl` - Website link
- `posts` - Recent posts (if requested)

---

## ⚡ Rate Limiting & Performance

### Apify Rate Limits

**Free Tier:**
- 10 concurrent runs
- 100 actor runs/month
- Limited compute units

**Starter Plan ($49/mo):**
- 25 concurrent runs
- Unlimited actor runs
- $49 compute credits

**Your Configuration:**
```bash
MCP_APIFY_RPS=1      # 1 request per second
MCP_APIFY_BURST=3    # Burst up to 3
```

### Best Practices

1. **Start Conservative**
   - Use RPS=1 for testing
   - Increase gradually

2. **Batch Requests**
   - Send multiple usernames per call
   - Reduces API overhead

3. **Handle Errors Gracefully**
   - Retry failed requests (max 3 times)
   - Log errors for analysis

4. **Monitor Usage**
   - Check Apify dashboard daily
   - Set billing alerts

---

## 🧪 Testing Checklist

### Connection Tests
- [ ] MCP server responds
- [ ] Authentication succeeds
- [ ] Can list actors
- [ ] Can get actor details

### Actor Tests
- [ ] Instagram scraper works
- [ ] Data format is correct
- [ ] Required fields present
- [ ] Handles errors properly

### Integration Tests
- [ ] Discovery workflow works
- [ ] Enrichment workflow works
- [ ] Data transformation correct
- [ ] Rate limiting respected

### Performance Tests
- [ ] Can process 10 profiles
- [ ] Can process 50 profiles
- [ ] No memory leaks
- [ ] Acceptable speed

---

## 🐛 Troubleshooting

### "MCP server not accessible"

**Symptoms**: Scripts can't connect to MCP server

**Solutions**:
1. Check MCP settings file exists
2. Verify Apify server configured
3. Restart VS Code/Cline
4. Try manual server start: `npx @apify/mcp-server-apify`

### "Authentication failed"

**Symptoms**: 401 Unauthorized errors

**Solutions**:
1. Verify `APIFY_API_TOKEN` in MCP settings
2. Check token hasn't expired
3. Regenerate token in Apify Console
4. Ensure no extra spaces in token

### "Actor not found"

**Symptoms**: Can't find `apify/instagram-profile-scraper`

**Solutions**:
1. Check actor name spelling
2. Verify Apify account active
3. Check actor exists in Apify Store
4. Try with explicit version: `apify/instagram-profile-scraper@latest`

### "Rate limit exceeded"

**Symptoms**: 429 Too Many Requests

**Solutions**:
1. Reduce `MCP_APIFY_RPS` to 0.5 or lower
2. Add delays between requests
3. Check Apify plan limits
4. Upgrade plan if needed

### "Invalid data returned"

**Symptoms**: Missing or malformed data

**Solutions**:
1. Check Instagram profile is public
2. Verify profile exists
3. Check for Instagram API changes
4. Try different test profiles

---

## 📝 Data Flow Diagram

```
┌─────────────────┐
│  Seed CSV       │
│  (87 entries)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Your Code      │
│  (YAML Runner)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Server     │
│  (Apify)        │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│ Search Actors   │  │ Profile Scraper │
│ (Discovery)     │  │ (Enrichment)    │
└────────┬────────┘  └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────┐
         │  Raw Instagram  │
         │  Data           │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Data Transform │
         │  & Quality      │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Ingest API     │
         │  (Agent 3)      │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Supabase DB    │
         └─────────────────┘
```

---

## ✅ Completion Criteria

Agent 2 is complete when:

- [x] MCP server configured
- [x] Connection test passing
- [x] Instagram actor test passing
- [x] Enrichment workflow validated
- [x] Test scripts created
- [x] Documentation complete
- [x] Ready for Agent 3

---

## 🚀 Next Steps

Once Agent 2 is complete, proceed to:

**Agent 3: Database & Ingest API**
- Verify instagram_vendors table
- Create Supabase ingest endpoint
- Test data pipeline
- Implement error handling

**Estimated Time**: 1-2 hours

---

## 📞 Support Resources

- **Apify MCP Server**: https://github.com/apify/mcp-server-apify
- **Instagram Scraper**: https://apify.com/apify/instagram-profile-scraper
- **Apify API Docs**: https://docs.apify.com/api/v2
- **MCP Protocol**: https://modelcontextprotocol.io

---

**Status**: Ready to test! Follow steps 2-5 above.  
**Next Agent**: Agent 3 (Database & Ingest API)
