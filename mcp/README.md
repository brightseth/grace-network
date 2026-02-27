# Seth Goldstein MCP Server

An MCP (Model Context Protocol) server that allows Claude Code and other AI assistants to interact directly with Seth Goldstein's knowledge and persona.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_context` | Get Seth's bio at different depth levels (1, 10, 100, 1000, 10000 words) |
| `get_projects` | Get current projects and focus areas |
| `get_facts` | Get key facts, quotes, principles, and career milestones |
| `ask_seth` | Chat with Seth's AI persona (calls live API) |

## Installation

### For Claude Code

Add to your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "seth": {
      "command": "node",
      "args": ["/Users/seth/sethgoldstein.com/mcp/index.js"]
    }
  }
}
```

### Standalone Installation

```bash
cd mcp
npm install
npm start
```

## Usage Examples

Once configured, Claude Code can use these tools:

### Get Quick Context
```
"Who is Seth?" → Calls get_context with depth=100
```

### Get Current Projects
```
"What is Seth working on?" → Calls get_projects
```

### Ask a Question
```
"What does Seth think about AI art?" → Calls ask_seth
```

## Tool Details

### get_context
Returns Seth's bio at different "Powers of 10" depth levels:
- **1 word**: Just the handle (@seth)
- **10 words**: Tagline
- **100 words**: Summary paragraph
- **1000 words**: Full career bio
- **10000 words**: Complete biography

### get_projects
Returns current projects with optional filtering:
- `all`: All projects (default)
- `ai`: AI-focused projects (Eden, Abraham, SOLIENNE, Spirit Protocol)
- `art`: Art-focused projects (SOLIENNE, NODE, vibecodings)
- `infrastructure`: Infrastructure projects (Eden, Spirit Protocol, NODE)

### get_facts
Returns structured facts about Seth:
- `career`: Companies founded, exits, milestones
- `contact`: Twitter, email, LinkedIn, website
- `quotes`: Notable quotes from Seth
- `principles`: Core operating principles
- `all`: Everything (default)

### ask_seth
Sends a question to Seth's AI persona via the live API. This uses Claude with Honcho memory to provide personalized, contextual responses. Falls back to a polite offline message if the API is unavailable.

## Architecture

```
Claude Code
    ↓
MCP Protocol (stdio)
    ↓
seth-mcp server
    ↓
Local data (get_context, get_projects, get_facts)
    or
sethgoldstein.com/api/seth-brain (ask_seth)
```

## Why This Exists

This is an experiment in making personal websites LLM-friendly. Instead of just having static content that LLMs must scrape and parse, this server provides:

1. **Structured access** to biographical information at various depths
2. **Real-time interaction** with an AI persona that can answer questions
3. **Native integration** with Claude Code and other MCP-compatible tools

It's part of a broader effort to create AI-native personal infrastructure.

## Related

- [sethgoldstein.com](https://sethgoldstein.com) - Main website
- [llms.txt](https://sethgoldstein.com/llms.txt) - LLM guidance file
- [seth.json](https://sethgoldstein.com/seth.json) - Structured data export
- [/api/context](https://sethgoldstein.com/api/context) - HTTP API for bio at any depth
