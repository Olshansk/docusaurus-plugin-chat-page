
.PHONY: clean_embeddings
clean_embeddings: ## Remove embedding cache files from target site roots
	@echo "🧹 Cleaning embedding cache files..."
	@find . -name "embeddings.json" -not -path "./node_modules/*" -delete 2>/dev/null || true
	@find . -name ".docusaurus" -type d -exec find {} -name "*embeddings.json" -delete \; 2>/dev/null || true
	@echo "✅ Embedding cache files cleaned"

.PHONY: clean_docusaurus_cache
clean_docusaurus_cache: ## Remove all Docusaurus cache directories
	@echo "🧹 Cleaning all Docusaurus cache directories..."
	@find . -name ".docusaurus" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Docusaurus cache directories cleaned"