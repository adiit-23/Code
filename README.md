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
