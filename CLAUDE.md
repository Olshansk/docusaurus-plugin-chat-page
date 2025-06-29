# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docusaurus plugin that adds an AI-powered chat interface to documentation sites. The plugin processes documentation content at build time, generates embeddings using OpenAI's API, and provides a chat interface for users to ask questions about the documentation.

## Common Development Commands

```bash
# Build the plugin (includes CSS copying)
npm run build

# Watch mode for development (TypeScript only)
npm run watch

# Clean build artifacts
npm run clean

# Copy CSS files after build (automatically done by build command)
npm run copy-css

# Build and prepare for GitHub install (includes git commit)
make build-github

# Clean embedding cache files
make clean_embeddings

# Clean Docusaurus cache directories
make clean_docusaurus_cache
```

## Local Development Setup

For local development with a test Docusaurus site:

```bash
# In plugin directory
yarn build
yarn link

# In test Docusaurus project
yarn link docusaurus-plugin-chat-page
```

## Architecture Overview

### Plugin Structure

- **src/index.ts**: Main plugin entry point implementing Docusaurus plugin lifecycle (loadContent/contentLoaded hooks)
- **src/content.ts**: Content processing, markdown parsing, embedding generation, and cache management
- **src/services/ai.ts**: OpenAI API integration for embeddings and chat completions with retry logic
- **src/types.ts**: TypeScript type definitions and plugin interfaces
- **src/utils/**: Utility modules for vector operations and error handling
- **src/theme/ChatPage/**: Complete React chat interface with components and hooks
- **src/constants.ts**: Configuration defaults and file patterns

### Component Architecture

- **Theme Components**: ChatPage, ChatHistory, ChatInput, ChatMessage, ChatSidebar, ErrorBoundary
- **Hooks**: useAIChat (streaming responses), useChatState (session/conversation management)
- **Utils**: Vector similarity search, error handling with retry mechanisms

### Build Process

1. **Content Loading**: Scans documentation files using glob patterns, processes markdown with frontmatter
2. **Chunk Generation**: Splits content by headers or paragraphs with configurable size limits
3. **Embedding Generation**: Batched OpenAI API calls with caching and retry logic
4. **Static Generation**: Creates embeddings.json for client-side similarity search
5. **Theme Registration**: Registers React components in Docusaurus theme system

### Runtime Architecture

- **Client-side vector search**: Cosine similarity search using pre-computed embeddings
- **Streaming chat**: Real-time OpenAI API responses with proper error boundaries
- **State management**: Conversation history with session persistence
- **URL generation**: Automatic documentation link creation from file paths

## Key Configuration

Plugin requires OpenAI API key in docusaurus.config.js:

```js
plugins: [
  [
    "docusaurus-plugin-chat-page",
    {
      path: "chat",
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    },
  ],
];
```

## Development Workflow

### TypeScript Build Process

- TypeScript compilation: `src/` → `lib/`
- CSS files automatically copied via build script
- Declaration files generated for proper typing
- Source maps included for debugging

### Embedding Cache Strategy

- **Development**: Use `"auto"` mode (always regenerate)
- **CI/CD**: Use `"use"` mode with pre-generated cache
- Cache files stored as `embeddings.json` in target site root
- Clean cache with `make clean_embeddings`

## Important Notes

- OpenAI API key is only used at build time for embedding generation
- The plugin uses Docusaurus content loading lifecycle (loadContent/contentLoaded)
- CSS files are automatically copied during build process
- Plugin follows Docusaurus plugin architecture with proper theme path registration
- No testing framework currently configured
- Error handling includes retry logic for OpenAI API calls
- Vector similarity search runs entirely client-side for performance
