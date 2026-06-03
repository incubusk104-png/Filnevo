# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple Python project with a single entry point (`main.py`) that prints a greeting. The project uses UV for dependency management and targets Python 3.14+.

## Key Files

- `main.py`: Contains the main application logic
- `pyproject.toml`: Project configuration and dependencies (currently includes `requests>=2.34.2`)
- `uv.lock`: Lock file for reproducible dependencies
- `.python-version`: Specifies Python version 3.14
- `README.md`: Project documentation (currently minimal)

## Development Commands

### Setup
```bash
# Install dependencies using UV
uv sync

# Alternatively, install in development mode
uv pip install -e .
```

### Running the Application
```bash
# Run directly with Python
python main.py

# Or using UV
uv run main.py
```

### Testing
Currently, no tests are configured. To add tests:
1. Create a `tests/` directory
2. Add test files (e.g., `test_main.py`)
3. Install a test framework (e.g., `pytest`) via `uv add --dev pytest`
4. Run tests with `uv run pytest`

### Linting/Formatting
No linting tools are configured by default. To add:
1. Install a linter (e.g., `ruff` or `flake8`) via `uv add --dev ruff`
2. Configure in `pyproject.toml` or separate config file
3. Run with `uv run ruff check .` (for ruff)

## Architecture Notes

This is a minimal single-file application:
- Entry point: `main.py` contains a `main()` function that prints a message
- The `if __name__ == "__main__":` block ensures the script runs directly
- Dependencies are managed via UV and declared in `pyproject.toml`
- The project structure is intentionally simple for demonstration purposes

## Extending the Project

When adding features:
1. Consider separating concerns into multiple modules if the project grows
2. Add tests for new functionality
3. Update dependencies in `pyproject.toml` as needed
4. Keep the entry point in `main.py` or consolidate in a dedicated module
