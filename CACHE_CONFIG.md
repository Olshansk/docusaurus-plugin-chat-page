# Simplified Cache Configuration

## New Cache Configuration

The cache configuration has been simplified to use a single `mode` parameter instead of confusing `enabled` + `strategy` combinations.

### Configuration Options

```typescript
embeddingCache: {
  mode: "auto" | "use" | "skip",  // Cache behavior
  path?: string                   // Cache file path (default: "embeddings.json")
}
```

### Cache Modes

| Mode     | Behavior                                       | Use Case                                 |
| -------- | ---------------------------------------------- | ---------------------------------------- |
| `"auto"` | Always regenerate embeddings and save to cache | **Default** - Always fresh embeddings    |
| `"use"`  | Use existing cache, error if missing           | Production with pre-generated embeddings |
| `"skip"` | Always regenerate, don't save cache            | Testing/debugging                        |

### Cache Location

Embeddings are stored in: `{target-site-root}/embeddings.json`

**Example**: `/Users/olshansky/workspace/pocket/poktroll2/docusaurus/embeddings.json`

### Usage Examples

**Development (always regenerate):**

```js
// docusaurus.config.js
embeddingCache: {
  mode: "auto"; // Default - always regenerate and save
}
```

**Production (use existing):**

```js
// docusaurus.config.js
embeddingCache: {
  mode: "use"; // Use existing, error if missing
}
```

**Testing (don't save):**

```js
// docusaurus.config.js
embeddingCache: {
  mode: "skip"; // Regenerate but don't save
}
```

### Migration from Old Config

| Old Config                          | New Config     |
| ----------------------------------- | -------------- |
| `enabled: false`                    | `mode: "skip"` |
| `enabled: true, strategy: "hash"`   | `mode: "auto"` |
| `enabled: true, strategy: "manual"` | `mode: "use"`  |

### Cleaning Cache

Use the makefile:

```bash
make -f makefiles/docs.mk clean_embeddings
```

This removes `embeddings.json` from target site roots and any `.docusaurus` cache files.
