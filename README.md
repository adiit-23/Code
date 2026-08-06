# ⚡ Code – Interactive Coding & Algorithmic Practice Platform

A modern, high-performance web platform designed for practicing data structures and algorithms. Users can solve multi-language coding challenges, execute code against test suites in real-time, analyze memory and runtime execution metrics, and track their technical growth through an interactive profile dashboard.

---

## ✨ Key Features

* 🔐 **Authentication & User Management**: Secure user onboarding, session handling, and OAuth login powered by **Clerk**.
* ⚡ **Real-Time Code Execution Engine**: Integrated with **Judge0 API** via an Nginx reverse proxy to compile and execute code securely across multiple programming languages.
* 📊 **Comprehensive Analytics & Profile Dashboard**: 
  * Aggregates submission history, test case memory consumption, and execution time metrics.
  * Interactive solved problem history with seamless deep-linking to problem details.
  * Custom problem playlists and collection management.
* 🎨 **Modern & Responsive UI**: Clean interface built with **Tailwind CSS**, **Shadcn/UI**, and **Lucide Icons** with full dark/light mode support.
* 🗄️ **Database Architecture**: Serverless PostgreSQL database hosted on **Neon**, using **Prisma ORM** to manage relational schemas for `User`, `Problem`, `Submission`, and `ProblemSolved` models.

---

## 🛠️ Tech Stack

### **Frontend & Core Framework**
* **Framework**: Next.js 14 (App Router, Server Actions)
* **Styling & Components**: Tailwind CSS, Shadcn/UI, Lucide React
* **Authentication**: Clerk Auth

### **Backend & Infrastructure**
* **Database**: Serverless PostgreSQL (Neon)
* **ORM**: Prisma ORM
* **Code Execution**: Judge0 API (Proxied via Nginx)
* **Containerization**: Docker, Nginx
# AlgoVerse 🚀

An interactive coding and algorithm practice platform built with Next.js, designed to handle real-time code execution and scalable user management.

## 🛠 Tech Stack

*   **Frontend & API:** Next.js (App Router), React, Tailwind CSS
*   **Database:** Neon PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** Clerk
*   **Code Execution Engine:** Judge0 (Containerized via Docker)
*   **Deployment:** Vercel (Frontend) / VPS (Judge0)

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+)
*   npm or yarn
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For running the Judge0 execution engine locally on macOS)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys. 

> **Note:** For local development, use your Clerk Development keys. For the database, use your Neon pooled connection string.

```env
# Database (Neon PostgreSQL Pooled URL)
DATABASE_URL="postgresql://user:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Judge0 Code Execution API
NEXT_PUBLIC_JUDGE0_API_URL="http://localhost:2358"
```

---

## 🚀 Local Installation

**1. Clone the repository**
```bash
git clone https://github.com/adiit-23/Code.git
cd Code
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up the database**
Push the schema to your Neon database and generate the local TypeScript types (crucial for resolving `UserRole` and other custom enum imports):
```bash
npx prisma db push
npx prisma generate
```

**4. Start the Next.js development server**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 🐳 Judge0 Local Setup (Docker)

To execute code submissions locally, you need to spin up the Judge0 engine using Docker. The configuration relies on the provided `docker-compose.yml` and `nginx.conf` files.

**1. Start the Judge0 containers**
Ensure Docker Desktop is running, then execute:
```bash
docker-compose up -d
```

**2. Verify the engine**
Wait a few moments for the database and workers to initialize, then check if Judge0 is active:
```bash
curl http://localhost:2358/system_info
```

To stop the execution engine:
```bash
docker-compose down
```

---

## 🌍 Deployment Notes

*   **Frontend (Vercel):** The Next.js application is configured to deploy seamlessly on Vercel. Ensure your `package.json` build script is set to `"build": "prisma generate && next build"` to prevent missing type errors during Vercel's build phase.
*   **Backend (VPS):** The `docker-compose.yml` is intended to be deployed on an external virtual private server (VPS). Once deployed, update the `NEXT_PUBLIC_JUDGE0_API_URL` in your Vercel Environment Variables to point to your live VPS IP/Domain.

---
*Code with Love*
