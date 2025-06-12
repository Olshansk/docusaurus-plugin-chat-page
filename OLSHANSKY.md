# Olshansky's Thoughts & Learnings

## Local Development

```bash
# In your plugin repo
yarn build
yarn link

# In your Docusaurus project
yarn link docusaurus-plugin-chat-page
```

## Pointing to a GitHub repo instead of an npm package

Need to push `lib` folder to GitHub which is usually not tracked by git since it's built by npm package managers.

```bash
yarn install
yarn build
git add -f lib
git commit -m "Build plugin for GitHub install"
```

## Things I want to do

- [ ] Add support for OpenRouter instead of OpenAI
- [ ] Customize how I generate embeddings
- [ ] Customize the prompt
- [ ] Add code snippets in the prompt
- [ ] Add links in the responses
