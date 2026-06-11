.PHONY: install dev test lint format typecheck package clean

VENV ?= .venv
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

install:  ## Create venv and install dev dependencies
	python -m venv $(VENV)
	$(PIP) install -U pip
	$(PIP) install -r requirements-dev.txt

dev:  ## Run the API locally with reload on :8000
	$(VENV)/bin/uvicorn app.main:app --reload --port 8000

test:  ## Run the test suite (moto-mocked DynamoDB)
	$(VENV)/bin/pytest

lint:  ## Lint + format check
	$(VENV)/bin/ruff check .
	$(VENV)/bin/ruff format --check .

format:  ## Auto-format
	$(VENV)/bin/ruff format .
	$(VENV)/bin/ruff check --fix .

typecheck:  ## Static type check
	$(VENV)/bin/mypy app

package:  ## Build the Lambda deployment zip into build/function.zip
	rm -rf build && mkdir -p build/pkg
	$(PIP) install -r requirements.txt -t build/pkg \
		--platform manylinux2014_x86_64 --implementation cp \
		--python-version 3.12 --only-binary=:all: --upgrade
	cp -r app build/pkg/app
	cd build/pkg && zip -r ../function.zip . -x '*.pyc' -x '*__pycache__*'

clean:
	rm -rf build .pytest_cache .mypy_cache .ruff_cache
