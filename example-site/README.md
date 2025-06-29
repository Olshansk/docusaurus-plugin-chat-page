# Example Docusaurus Site with Chat Plugin

This is an example Docusaurus site that demonstrates the `docusaurus-plugin-chat-page` integration.

## Quick Start

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **For local development with the plugin:**
   ```bash
   # In the plugin root directory (go back one level)
   cd ..
   yarn build
   yarn link
   
   # Back in this example directory
   cd example-site
   yarn link docusaurus-plugin-chat-page
   ```

4. **Start development server:**
   ```bash
   yarn start
   ```

5. **Visit the chat page:**
   Open http://localhost:3000/chat to see the AI chat interface in action!

## Features Demonstrated

- Basic plugin integration
- Chat page at `/chat` route
- Navigation bar integration
- OpenAI API integration for embeddings and chat

## Configuration

The plugin is configured in `docusaurus.config.ts` with minimal settings:

```typescript
plugins: [
  [
    'docusaurus-plugin-chat-page',
    {
      path: 'chat',
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    },
  ],
],
```

## Building for Production

```bash
yarn build
```

The plugin will process all documentation files and generate embeddings during the build process.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
