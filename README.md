# practice.expandtesting.com.playwright

Automated API and end-to-end tests for [practice.expandtesting.com](https://practice.expandtesting.com) using **Playwright** and **TypeScript**.

---

## 📘 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Configuration](#configuration)
- [Folder Structure](#folder-structure)

---

## 🧭 Overview

This project provides automated API and UI tests for the [practice.expandtesting.com](https://practice.expandtesting.com) website, built using Playwright + TypeScript.  
The goal is to ensure website quality by validating key flows, API endpoints, page functionality, and UI stability.

---

## ✨ Features

- ✅ End-to-end tests using **Playwright Test Runner**
- 🔌 API testing with HTTP status validation
- 🧩 TypeScript support
- 🌐 Multi-browser testing (Chromium, Firefox, WebKit)
- 📸 Automatic screenshots and trace captures on failures
- ⚙️ Configurable test settings via `playwright.config.ts`
- 🧱 Page Object Model (POM) structure for maintainability
- 🎲 Test data generation with **Faker.js**
- 💡 Easy CI/CD integration (via GitHub Actions)

---

## 🧰 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm or yarn
- A modern browser (Playwright can also install them automatically)

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/mihneav/practice.expandtesting.com.playwright.git
cd practice.expandtesting.com.playwright

# Install dependencies
npm install
# or
yarn install

# (Optional) Install Playwright browsers
npx playwright install
```

---

## 🚀 Running Tests

Run all tests:
```bash
npm test
```

Run API tests only:
```bash
npm run test:api
```

Run E2E tests only:
```bash
npm run test:e2e
```

Run tests in headed mode (visible browser window):
```bash
npm run test:headed
```

Run tests in debug mode:
```bash
npm run test:debug
```

Run tests in UI mode (interactive):
```bash
npm run ui
```

Generate and view HTML report:
```bash
npm run report
```

---

## ⚙️ Configuration

Main configuration file: **`playwright.config.ts`**

You can customize:
- Test directories and timeouts
- Browser projects (API Tests, E2E Tests)
- Reporters (HTML, list, JSON, etc.)
- Screenshot and trace settings
- Base URL and environment variables
- HTTP headers for API requests

The configuration includes two test projects:
- **API Tests**: Located in `tests/api/`, runs without screenshots/video
- **E2E Tests**: Located in `tests/e2e/`, runs on Desktop Chrome with 1280x720 viewport

---

## 🗂 Folder Structure

```
.
├── .github/workflows/       # CI/CD workflows
├── .vscode/                 # VSCode settings
├── lib/                     # Page objects and helper classes
├── pageRepository/          # Page Object Model classes
├── tests/                   # Test suites (.spec.ts)
│   ├── api/                 # API test files
│   └── e2e/                 # End-to-end test files
├── utils/                   # Shared utilities
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

---
