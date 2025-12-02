# practice. expandtesting.com. api. playwright

Automated API tests for [ExpandTesting.com](https://practice.expandtesting.com/) using **Playwright** and **TypeScript**.

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

This project provides automated API tests for the [ExpandTesting.com](https://practice.expandtesting.com/) practice website, built using Playwright + TypeScript.  
The goal is to ensure API quality by validating endpoints, data handling, and response integrity through comprehensive test automation.

---

## ✨ Features

- ✅ API tests using **Playwright Test Runner**
- 🧩 TypeScript support
- 🌐 HTTP request testing with built-in API client
- 📊 Automatic test data generation with **Faker. js**
- 🔍 HTTP status code validation with **http-status-codes**
- ⚙️ Configurable test settings via `playwright.config. ts`
- 🧱 Modular structure with utilities for maintainability
- 💡 Easy CI/CD integration (via GitHub Actions)

---

## 🧰 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs. org/) (v14 or higher)
- npm or yarn
- Access to the ExpandTesting.com practice API

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/mihneav/practice.expandtesting.com.api.playwright.git
cd practice. expandtesting.com.api. playwright

# Install dependencies
npm install
# or
yarn install

# (Optional) Install Playwright browsers for any UI components
npx playwright install
```

---

## 🚀 Running Tests

Run all tests:
```bash
npx playwright test
```

Run tests with specific tag:
```bash
npx playwright test --grep "@api"
```

Run a single test file:
```bash
npx playwright test tests/example-api.spec.ts
```

Run tests with detailed output:
```bash
npx playwright test --reporter=list
```

Record a trace for debugging:
```bash
npx playwright test --trace on
```

Generate an HTML report:
```bash
npx playwright show-report
```

---

## ⚙️ Configuration

Main configuration file: **`playwright. config.ts`**

You can customize:
- Test directories and timeouts
- API base URLs and endpoints
- Reporters (HTML, list, JSON, etc.)
- Request/response logging settings
- Environment variables

---

## 🗂 Folder Structure

```
.
├── . github/                 # GitHub workflows and configurations
├── playwright/              # Playwright setup and configuration files
├── tests/                   # API test suites (.spec.ts)
├── utils/                   # Shared utilities and helper functions
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔗 Related Resources

- [ExpandTesting. com Practice Site](https://practice.expandtesting.com/)
- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
