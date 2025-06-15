########################
### Makefile Helpers ###
########################

.PHONY: list
list: ## List all make targets
	@${MAKE} -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort

.PHONY: help
.DEFAULT_GOAL := help
help: ## Prints all the targets in all the Makefiles
	@grep -h -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-60s\033[0m %s\n", $$1, $$2}'

########################
### Build Targets ###
########################

.PHONY: build-github
build-github: ## Build the project and prepare it for GitHub install
	@echo "Installing dependencies with yarn..."
	yarn install
	@echo "Building the project..."
	yarn build
	@echo "Adding built files in lib to git..."
	git add -f lib
	@echo "Committing build for GitHub install..."
	git commit -m "Build plugin for GitHub install"