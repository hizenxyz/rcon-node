# RCON-Node Development Agent

This document defines the recommended tasks and workflows for developing the `rcon-node` project. It is intended for both developers and AI assistants to streamline and standardize the development process.

## 1. Project Overview

`rcon-node` is a TypeScript-based RCON client library for modern game servers. It provides a simple, efficient interface for interacting with game servers that support the RCON protocol.

### Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Testing**: Vitest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Build Tool**: TypeScript Compiler (`tsc`)

## 2. Development Tasks

The following tasks are defined in `package.json` and can be executed with `npm run <task>`:

| Task            | Command                                             | Description                                               |
| --------------- | --------------------------------------------------- | --------------------------------------------------------- |
| `build`         | `tsc`                                               | Compiles TypeScript source code into JavaScript.          |
| `dev`           | `tsc --watch`                                       | Watches for file changes and recompiles automatically.    |
| `lint`          | `eslint src/**/*.ts tests/**/*.ts`                  | Lints source and test files for errors and style issues.  |
| `lint:fix`      | `eslint src/**/*.ts tests/**/*.ts --fix`            | Automatically fixes linting errors.                       |
| `format`        | `prettier --write ...`                              | Formats the codebase using Prettier.                      |
| `format:check`  | `prettier --check ...`                              | Checks for formatting issues without modifying files.     |
| `typecheck`     | `tsc --noEmit`                                      | Performs type checking without emitting JavaScript files. |
| `test`          | `vitest run`                                        | Runs the test suite once.                                 |
| `test:watch`    | `vitest`                                            | Runs tests in watch mode, rerunning on file changes.      |
| `test:ui`       | `vitest --ui`                                       | Starts the Vitest UI for interactive testing.             |
| `test:coverage` | `vitest run --coverage`                             | Runs tests and generates a coverage report.               |
| `ci`            | `npm run typecheck && npm run lint && npm run test` | Runs type checks, linting, and tests for CI workflows.    |

## 3. Parallelizable Task Creation for Codex/AI

To maximize team efficiency and minimize merge conflicts, Codex and AI agents should generate development tasks that can be completed in parallel by different contributors. This means breaking down work into discrete, non-overlapping units that do not touch the same files or code sections whenever possible.

### Guidelines for Parallelizable Tasks

- **Isolate Concerns:** Each task should focus on a single feature, bug fix, or refactor that does not overlap with others.
- **Minimize File Overlap:** Assign tasks so that changes are made to different files or, if in the same file, to clearly separated sections.
- **Define Clear Boundaries:** Document the scope and boundaries of each task to avoid ambiguity.
- **Avoid Global Refactors:** Large-scale changes (e.g., renaming across the codebase) should be scheduled when no other tasks are in progress.
- **Communicate Dependencies:** If a task depends on another, document this explicitly so tasks are sequenced correctly.
- **Example:**
  - Task A: Implement a new utility function in `src/utils/`.
  - Task B: Add a new test suite in `tests/games/`.
  - Task C: Update documentation in `README.md`.
    These tasks can be completed in parallel because they do not modify the same files or code sections.

By following these guidelines, Codex/AI can help contributors work efficiently and reduce the risk of merge conflicts.

## 4. Local Development Workflow

For individual developers, it is recommended to run key tasks in parallel using multiple terminal tabs or panes. This approach ensures immediate feedback on changes and enforces code quality throughout development.

### Recommended Setup

**Terminal 1: Watch & Rebuild**

```bash
npm run dev
```

Continuously watches for changes in the `src` directory and recompiles the TypeScript code.

**Terminal 2: Watch & Test**

```bash
npm run test:watch
```

Automatically reruns tests on changes to source or test files.

**Terminal 3: Linting & Formatting**

Use this terminal for manual code quality tasks:

```bash
# Check linting issues
npm run lint

# Fix linting errors
npm run lint:fix

# Format the codebase
npm run format
```

Running these tasks in parallel helps keep your codebase consistently compiling, tested, and aligned with style guidelines without repeated manual intervention.

## 5. Pre-Commit Checks

Before committing, run the following commands to validate your changes:

```bash
pnpm validate
pnpm test
```

These checks ensure type safety, coding standards, and test integrity are upheld.
