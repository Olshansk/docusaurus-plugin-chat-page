# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docusaurus plugin that adds an AI-powered chat interface to documentation sites. The plugin processes documentation content at build time, generates embeddings using OpenAI's API, and provides a chat interface for users to ask questions about the documentation.

## Common Development Commands

```bash
# Build the plugin
npm run build

# Build with CSS copying
npm run build && npm run copy-css

# Watch mode for development
npm run watch

# Clean build artifacts
npm run clean

# Copy CSS files after build
npm run copy-css
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

- **src/index.ts**: Main plugin entry point implementing Docusaurus plugin lifecycle
- **src/content.ts**: Content processing, markdown parsing, and embedding generation
- **src/services/ai.ts**: OpenAI API integration for embeddings and chat completions
- **src/types.ts**: TypeScript type definitions for the plugin
- **src/theme/ChatPage/**: React component for the chat interface

### Build Process

1. **Content Loading**: Scans documentation files, processes markdown with frontmatter
2. **Chunk Generation**: Splits content into manageable chunks for embedding
3. **Embedding Generation**: Uses OpenAI's text-embedding-3-small model
4. **Static Generation**: Creates embeddings.json for client-side similarity search

### Runtime Architecture

- **Client-side vector search**: Finds relevant documentation chunks using cosine similarity
- **Streaming chat**: Uses OpenAI's gpt-4o-mini for contextual responses
- **Theme integration**: Provides React component that integrates with Docusaurus theme system

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

## Important Notes

- OpenAI API key is only used at build time for embedding generation
- The plugin uses Docusaurus content loading lifecycle (loadContent/contentLoaded)
- CSS files must be manually copied after TypeScript compilation
- Plugin follows Docusaurus plugin architecture with proper theme path registration
