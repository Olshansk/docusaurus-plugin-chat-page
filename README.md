# Docusaurus Plugin Chat Page

**AI-powered documentation assistant for your Docusaurus site** 🤖

Transform your static documentation into an interactive experience. Users can ask questions in natural language and get instant, contextually relevant answers powered by OpenAI's GPT models.

<!-- GIFT SECTION PLACEHOLDER - TO BE UPDATED -->

> **🎁 Looking for a special offer?**
>
> [Placeholder for gift/special offer details - to be added]

---

## 🚀 Quick Start

Get up and running in under 5 minutes:

### 1. Install

```bash
npm install docusaurus-plugin-chat-page
# or
yarn add docusaurus-plugin-chat-page
```

### 2. Configure

Add to your `docusaurus.config.js`:

```js
module.exports = {
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
  ],
};
```

### 3. Set API Key

Create `.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Build & Run

```bash
npm run build && npm start
```

Visit `/chat` on your site - that's it! 🎉

---

## ⚡ Why Use This Plugin?

| Feature                      | Benefit                              |
| ---------------------------- | ------------------------------------ |
| 🤖 **AI-Powered**            | Natural language Q&A about your docs |
| 🔍 **Smart Search**          | Semantic search using embeddings     |
| ⚡ **Fast Runtime**          | Client-side similarity search        |
| 🔒 **Secure**                | API keys only used at build time     |
| 💅 **Theme Integration**     | Matches your Docusaurus theme        |
| 📱 **Responsive**            | Works on all devices                 |
| 🏗️ **Build-Time Processing** | No runtime performance impact        |

---

## 📋 Configuration Options

### Basic Configuration

| Option          | Type     | Default      | Description                      |
| --------------- | -------- | ------------ | -------------------------------- |
| `path`          | `string` | `"chat"`     | URL path for chat page           |
| `label`         | `string` | `"Chat"`     | Navigation label                 |
| `baseURL`       | `string` | `undefined`  | Base URL for documentation links |
| `openai.apiKey` | `string` | **Required** | OpenAI API key                   |

### OpenAI Models & Settings

| Option                | Type     | Default         | Description               |
| --------------------- | -------- | --------------- | ------------------------- |
| `prompt.model`        | `string` | `"gpt-4o-mini"` | Chat completion model     |
| `prompt.temperature`  | `number` | `0.7`           | Response creativity (0-1) |
| `prompt.maxTokens`    | `number` | `1000`          | Maximum response length   |
| `prompt.systemPrompt` | `string` | Built-in        | Custom system prompt      |

### Embedding Configuration

| Option                       | Type     | Default                    | Description                   |
| ---------------------------- | -------- | -------------------------- | ----------------------------- |
| `embedding.model`            | `string` | `"text-embedding-3-small"` | Embedding model               |
| `embedding.chunkSize`        | `number` | `1500`                     | Max characters per chunk      |
| `embedding.chunkingStrategy` | `string` | `"headers"`                | `"headers"` or `"paragraphs"` |
| `embedding.batchSize`        | `number` | `10`                       | Embeddings per API batch      |
| `embedding.maxChunksPerFile` | `number` | `10`                       | Max chunks per file           |
| `embedding.relevantChunks`   | `number` | `3`                        | Chunks included in responses  |

### Caching Options

| Option                    | Type      | Default             | Description                            |
| ------------------------- | --------- | ------------------- | -------------------------------------- |
| `embeddingCache.enabled`  | `boolean` | `true`              | Enable embedding cache                 |
| `embeddingCache.strategy` | `string`  | `"hash"`            | `"hash"`, `"timestamp"`, or `"manual"` |
| `embeddingCache.path`     | `string`  | `"embeddings.json"` | Cache file location                    |

---

## 🛠️ Complete Configuration Example

```js
module.exports = {
  plugins: [
    [
      "docusaurus-plugin-chat-page",
      {
        // Basic settings
        path: "chat",
        label: "AI Assistant",
        baseURL: "https://docs.example.com",

        // OpenAI configuration
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
        },

        // Chat behavior
        prompt: {
          systemPrompt:
            "You are a helpful technical assistant. Always provide step-by-step solutions.",
          model: "gpt-4o-mini",
          temperature: 0.3,
          maxTokens: 800,
        },

        // Content processing
        embedding: {
          model: "text-embedding-3-small",
          chunkSize: 2000,
          chunkingStrategy: "headers",
          batchSize: 5,
          maxChunksPerFile: 15,
          relevantChunks: 5,
        },

        // Performance optimization
        embeddingCache: {
          enabled: true,
          strategy: "hash", // Use "manual" for CI/CD
        },
      },
    ],
  ],
};
```

---

## 🔗 Add to Navigation

Include the chat page in your site navigation:

```js
module.exports = {
  themeConfig: {
    navbar: {
      items: [
        // ... other items
        {
          to: "/chat",
          label: "Chat",
          position: "right",
        },
      ],
    },
  },
};
```

---

## 🎯 How It Works

### Build Time

1. **Content Processing** - Scans your markdown files
2. **Chunking** - Splits content into manageable pieces
3. **Embedding Generation** - Creates vector embeddings using OpenAI
4. **Static Export** - Saves embeddings as static JSON

### Runtime

1. **User Query** - User asks a question
2. **Similarity Search** - Finds relevant content chunks (client-side)
3. **AI Response** - Generates contextual answer using OpenAI
4. **Real-time Streaming** - Displays response as it's generated

---

## 💡 Performance Tips

### For Development

```js
embeddingCache: {
  strategy: "hash", // Regenerates when content changes
}
```

### For CI/CD

```js
embeddingCache: {
  strategy: "manual", // Never regenerates automatically
}
```

Commit `embeddings.json` to git for faster CI builds:

```gitignore
# .gitignore
.docusaurus/*
!.docusaurus/embeddings.json
```

---

## 🔧 Advanced Features

### URL Link Generation

Configure `baseURL` to generate clickable documentation links:

| File Path                                | Generated URL                                              |
| ---------------------------------------- | ---------------------------------------------------------- |
| `docs/setup/installation.md`             | `https://docs.example.com/setup/installation`              |
| `1_operate/3_configs/supplier_config.md` | `https://docs.example.com/operate/configs/supplier_config` |

**Automatic transformations:**

- ✅ Removes `.md`/`.mdx` extensions
- ✅ Strips numeric prefixes (`1_operate` → `operate`)
- ✅ Converts underscores to hyphens in directories
- ✅ Environment-aware (localhost vs production)

### Custom System Prompts

```js
prompt: {
  systemPrompt: `You are a technical support specialist for our API documentation.

Rules:
- Always provide code examples when relevant
- Include links to relevant documentation sections
- If unsure, ask for clarification
- Keep responses concise but complete`,
}
```

### Advanced Chunking

```js
embedding: {
  chunkingStrategy: "headers", // Splits at markdown headers
  chunkSize: 1500, // Optimal for most use cases
  maxChunksPerFile: 10, // Prevents overly long files from dominating
}
```

---

## 📊 Model Comparison

| Model                    | Speed  | Cost   | Quality    | Use Case               |
| ------------------------ | ------ | ------ | ---------- | ---------------------- |
| `gpt-4o-mini`            | ⚡⚡⚡ | 💰     | ⭐⭐⭐     | Most documentation     |
| `gpt-4o`                 | ⚡⚡   | 💰💰💰 | ⭐⭐⭐⭐⭐ | Complex technical docs |
| `text-embedding-3-small` | ⚡⚡⚡ | 💰     | ⭐⭐⭐     | Default embedding      |
| `text-embedding-3-large` | ⚡⚡   | 💰💰   | ⭐⭐⭐⭐   | Higher accuracy needs  |

---

## 🛡️ Security & Privacy

- ✅ **Build-time only** - API keys never exposed to browsers
- ✅ **No data collection** - User queries aren't stored
- ✅ **Local processing** - Similarity search runs client-side
- ✅ **Secure headers** - All API calls use proper authentication

---

## 📋 Requirements

| Requirement    | Version       |
| -------------- | ------------- |
| **Docusaurus** | v2.0+         |
| **Node.js**    | v16+          |
| **OpenAI API** | Valid API key |

---

## 🚨 Troubleshooting

| Issue                  | Solution                                           |
| ---------------------- | -------------------------------------------------- |
| **"API key required"** | Set `OPENAI_API_KEY` in `.env` file                |
| **Build fails**        | Check API key permissions and rate limits          |
| **No responses**       | Verify `baseURL` configuration                     |
| **Slow builds**        | Enable caching with `embeddingCache.enabled: true` |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Setup

```bash
git clone https://github.com/your-username/docusaurus-plugin-chat-page.git
cd docusaurus-plugin-chat-page
yarn install
yarn build
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 💬 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nichnarmada/docusaurus-plugin-chat-page/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/nichnarmada/docusaurus-plugin-chat-page/discussions)
- 📧 **Email Support**: [Coming soon]

---

**Made with ❤️ for the Docusaurus community**
