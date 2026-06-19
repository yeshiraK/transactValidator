# ✦ TransactValidator

A web-based platform for validating and processing transaction datasets. Upload CSV files, perform comprehensive data quality checks, generate clean outputs, export error reports, and obtain AI-powered insights — all directly in the browser.

---

## 🛠 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Papa_Parse-4CAF50?style=for-the-badge">
  <img src="https://img.shields.io/badge/Groq_API-000000?style=for-the-badge">
  <img src="https://img.shields.io/badge/Llama_Model-1D4ED8?style=for-the-badge">
  <img src="https://img.shields.io/badge/JSZip-7C3AED?style=for-the-badge">
</p>

---

## ✨ Features

### ✅ Smart Validation
- Required field validation
- Country-specific phone validation
- Date validation
- Time validation (24-hour format)
- Email format validation
- Payment mode validation
- Amount validation
- Duplicate order detection
- General data integrity checks

### 📊 Analytics & Insights
- Pass/fail statistics
- Error categorization
- Dataset health metrics
- Validation dashboard

### 🤖 AI Summary
- Executive data quality summary
- Failure analysis
- Actionable recommendations

### 📦 Export & Processing
- Clean dataset generation
- Error report generation
- Automatic CSV chunking
- ZIP export

---

## 🏗 Architecture

<p align="center">
  <img src="./docs/architecture.png" width="100%">
</p>

---

## 📂 Sample Input Files

Located inside:

```text
sample-input/
```

Example datasets:

- sample1.csv
- sample2.csv
- sample3.csv

---

## 📁 Project Structure

```text
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   └── utils/
├── sample-input/
│   ├── sample1.csv
│   ├── sample2.csv
│   └── sample3.csv
├── README.md
├── package.json
├── pnpm-lock.yaml
└── vite.config.js
```

---

## 📌 Built With

- React
- Vite
- JavaScript
- Papa Parse
- Groq API
- Llama
- JSZip

---
