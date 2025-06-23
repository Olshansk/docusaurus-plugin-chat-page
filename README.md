# Docusaurus Plugin Chat Page <!-- omit in toc -->

**AI-powered documentation assistant for your Docusaurus site** 🤖

Transform your static documentation into an interactive experience. Users can ask questions in natural language and get instant, contextually relevant answers powered by OpenAI's GPT models.

<!-- GIFT SECTION PLACEHOLDER - TO BE UPDATED -->

> **🎁 Looking for a special offer?**
>
> [Placeholder for gift/special offer details - to be added]

---

> [!NOTE]
> This repo was originally forked from [nichnarmada/docusaurus-plugin-chat-page](https://github.com/nichnarmada/docusaurus-plugin-chat-page) but has since undergone significant changes and improvements.

## ToC <!-- omit in toc -->

- [🚀 Quick Start](#-quick-start)
  - [1. Install](#1-install)
  - [2. Configure](#2-configure)
  - [3. Set API Key](#3-set-api-key)
  - [4. Build \& Run](#4-build--run)
- [⚡ Why Use This Plugin?](#-why-use-this-plugin)
- [📋 Configuration Options](#-configuration-options)
  - [Basic Configuration](#basic-configuration)
  - [OpenAI Models \& Settings](#openai-models--settings)
  - [Embedding Configuration](#embedding-configuration)
  - [Caching Options](#caching-options)
- [🛠️ Complete Configuration Example](#️-complete-configuration-example)
- [🔗 Add to Navigation](#-add-to-navigation)
- [🎯 How It Works](#-how-it-works)
  - [Build Time](#build-time)
  - [Runtime](#runtime)
- [💡 Performance Tips](#-performance-tips)
  - [For Development](#for-development)
  - [For CI/CD](#for-cicd)
- [🔧 Advanced Features](#-advanced-features)
  - [URL Link Generation](#url-link-generation)
  - [Custom System Prompts](#custom-system-prompts)
  - [Advanced Chunking](#advanced-chunking)
- [📊 Model Comparison](#-model-comparison)
- [🛡️ Security \& Privacy](#️-security--privacy)
- [📋 Requirements](#-requirements)
- [🚨 Troubleshooting](#-troubleshooting)
- [🚀 Deployment](#-deployment)
  - [Deploying to Vercel](#deploying-to-vercel)
    - [1. Vercel Configuration](#1-vercel-configuration)
    - [2. Environment Variables](#2-environment-variables)
    - [3. Deployment Steps](#3-deployment-steps)
    - [4. Build Process](#4-build-process)
    - [5. Important Notes](#5-important-notes)
    - [6. Other Platforms](#6-other-platforms)
- [🤝 Contributing](#-contributing)
  - [Development Setup](#development-setup)
- [📄 License](#-license)
- [💬 Support](#-support)

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

| Option                       | Type     | Default                    | Description                        |
| ---------------------------- | -------- | -------------------------- | ---------------------------------- |
| `embedding.model`            | `string` | `"text-embedding-3-small"` | Embedding model                    |
| `embedding.chunkSize`        | `number` | `1500`                     | Max characters per chunk           |
| `embedding.chunkingStrategy` | `string` | `"headers"`                | `"headers"` or `"paragraphs"`      |
| `embedding.batchSize`        | `number` | `20`                       | Chunks per OpenAI API call (1-100) |
| `embedding.maxChunksPerFile` | `number` | `10`                       | Max chunks per file                |
| `embedding.relevantChunks`   | `number` | `3`                        | Chunks included in responses       |

### Caching Options

| Option                 | Type     | Default             | Description                          |
| ---------------------- | -------- | ------------------- | ------------------------------------ |
| `embeddingCache.mode`  | `string` | `"auto"`            | `"auto"`, `"use"`, or `"skip"`       |
| `embeddingCache.path`  | `string` | `"embeddings.json"` | Cache file location in target site   |

**Cache Modes:**
- `"auto"` - Always regenerate embeddings and save to cache (default)
- `"use"` - Use existing cache, error if missing (production)
- `"skip"` - Always regenerate embeddings, don't save cache (testing)

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
          mode: "auto", // Use "use" for CI/CD with pre-generated cache
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
  mode: "auto", // Always regenerate and save (default)
}
```

### For CI/CD with Pre-generated Cache

```js
embeddingCache: {
  mode: "use", // Use existing cache, error if missing
}
```

**Cache Storage Location:**
Embeddings are stored in: `{your-site-root}/embeddings.json`

**To track embeddings in git:**
```gitignore
# .gitignore - ensure embeddings.json is NOT ignored
# embeddings.json  <-- Remove this line if present
```

**Clean cache command:**
```bash
make -f makefiles/docs.mk clean_embeddings
```

---

## 🔧 Advanced Features

### URL Link Generation

Configure `baseURL` to generate clickable documentation links:

| File Path                                | Generated URL                                              |
| ---------------------------------------- | ---------------------------------------------------------- |
| `docs/setup/installation.md`             | `https://docs.example.com/setup/installation`              |
| `1_operate/3_configs/supplier_config.md` | `https://docs.example.com/operate/configs/supplier-config` |

**Automatic transformations:**

- ✅ Removes `.md`/`.mdx` extensions
- ✅ Strips numeric prefixes (`1_operate` → `operate`)
- ✅ Converts underscores to hyphens (`supplier_config` → `supplier-config`)
- ✅ Environment-aware (localhost:4000 vs production URLs)

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
  batchSize: 10, // How many chunks to process per API call
}
```

<details>
<summary>🚀 Batch Size Optimization</summary>

**What is batch size?**

- Number of text chunks sent to OpenAI API in a single request
- OpenAI allows up to 100 inputs per embedding API call
- Larger batches = fewer API calls = faster processing

**Batch size recommendations:**

| Documentation Size           | Recommended Batch Size | Why                                          |
| ---------------------------- | ---------------------- | -------------------------------------------- |
| **Small** (< 50 chunks)      | `batchSize: 5`         | Conservative, good for testing               |
| **Medium** (50-200 chunks)   | `batchSize: 10`        | Balanced speed and reliability               |
| **Large** (200+ chunks)      | `batchSize: 20`        | Faster processing, fewer API calls (default) |
| **Very Large** (500+ chunks) | `batchSize: 50`        | Maximum speed, requires stable connection    |

**Example batch processing:**

```
📊 100 chunks with batchSize: 10
   • API calls needed: 10 (100 ÷ 10)
   • Processing: 10 chunks per call

📊 100 chunks with batchSize: 25
   • API calls needed: 4 (100 ÷ 25)
   • Processing: 25 chunks per call (75% faster!)
```

</details>

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
| **Slow builds**        | Use `embeddingCache: { mode: "auto" }` (default)   |
| **Cache not found**    | Set `mode: "auto"` instead of `"use"`              |

---

## 🚀 Deployment

### Deploying to Vercel

To deploy a Docusaurus site using this plugin to Vercel:

#### 1. Vercel Configuration

| Setting              | Value          |
| -------------------- | -------------- |
| **Build Command**    | `yarn build`   |
| **Output Directory** | `build`        |
| **Install Command**  | `yarn install` |

#### 2. Environment Variables

Add the following environment variable in your Vercel dashboard:

```
OPENAI_API_KEY=your-openai-api-key-here
```

#### 3. Deployment Steps

1. **Push your Docusaurus site** (not just the plugin) to GitHub
2. **Connect Vercel** to your GitHub repository
3. **Configure build settings** as shown above
4. **Add environment variables** in Vercel dashboard
5. **Deploy** - Vercel will automatically build and deploy

#### 4. Build Process

```bash
# Vercel runs these commands automatically:
yarn install                    # Install dependencies
yarn build                     # Build static site with embeddings
# Plugin processes docs at build time
# OpenAI API key used to generate embeddings
# Static site deployed with pre-computed embeddings
```

#### 5. Important Notes

- ✅ **OpenAI API key** only used at build time (secure)
- ✅ **Embeddings** generated during build, not at runtime
- ✅ **No serverless functions** needed - fully static
- ⚠️ **Build time** may be longer due to embedding generation
- 💡 **Use embedding cache** to speed up subsequent builds

#### 6. Other Platforms

This plugin works with any static hosting platform:

| Platform         | Build Command | Output Directory |
| ---------------- | ------------- | ---------------- |
| **Vercel**       | `yarn build`  | `build`          |
| **Netlify**      | `yarn build`  | `build`          |
| **GitHub Pages** | `yarn build`  | `build`          |
| **AWS S3**       | `yarn build`  | `build`          |

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
