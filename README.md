# CareNova: AI-Powered Health Report Analyzer & Fitness Tracker

CareNova is a comprehensive health platform that combines AI-driven medical report analysis with a robust patient/doctor dashboard and a professional landing page. It leverages local AI capabilities via Ollama for privacy-focused data processing.

## 🌟 Key Features

- **AI Report Analysis**: Upload and analyze medical reports locally using Gemini/Ollama.
- **Patient Dashboard**: Track health metrics, view analysis history, and manage profiles.
- **Doctor Portal**: Specialized interface for healthcare professionals to review patient data.
- **Drug Pricing & Search**: Real-time medicine search and pricing via Netmeds API.
- **AI Chatbot**: Intelligent health assistant for immediate queries.
- **Email Service**: Automated health notifications and reports.

## 🏗️ Project Structure

The project is organized into several modules:

- **`/langing-_module-main`**: The public-facing landing page built with **React**, **Vite**, and **Tailwind CSS**.
- **`/dashborad_module-main`**: The core application platform.
  - **`dashborad_module-main`**: **Next.js 16** application with App Router, **TypeScript**, **Prisma ORM**, and **NextAuth**.
  - **`netmeds-api-master`**: **Express.js** backend serving medicine and pricing data.
  - **`email-service`**: **Node.js** service for handling automated communications.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)
- [Ollama](https://ollama.ai/) (for local AI features)
- [Gemini API Key](https://aistudio.google.com/) (configured in `.env` files)

### Quick Start (Windows)

The easiest way to start all services concurrently is using the provided batch script:

1. Open a terminal in the root directory.
2. Run the start script:
   ```cmd
   run-all.bat
   ```

### Manual Module Setup

If you prefer to run modules individually:

#### 1. Landing Page
```bash
cd langing-_module-main/langing-_module-main
pnpm install
pnpm dev --port 8081
```

#### 2. Dashboard
```bash
cd dashborad_module-main/dashborad_module-main
pnpm install
pnpm dev
```

#### 3. Netmeds API
```bash
cd dashborad_module-main/netmeds-api-master
npm install
npm start
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React, Vite, Tailwind CSS, Framer Motion, shadcn/ui.
- **Backend**: Node.js, Express, Prisma ORM.
- **AI/ML**: Gemini API, Ollama (Local AI).
- **Database**: PostgreSQL/SQLite (via Prisma).
- **State Management**: Zustand, TanStack Query.

## 📄 License

Built with ❤️ for the healthcare community.