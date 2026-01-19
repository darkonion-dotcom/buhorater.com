# Buho Rater

Buho Rater is a specialized web platform developed for the student community of the **University of Sonora (Unison)**. It enables students to evaluate professor performance, visualize aggregate statistics, and access academic information securely and anonymously.

**Official URL:** https://buhorater.com

## Project Overview

The project addresses the need for transparent academic feedback. Unlike static directories, Buho Rater utilizes a modern, multi-layered architecture to ensure data integrity, prevent spam, and provide real-time sentiment analysis on reviews.

## Key Features

### 1. AI-Powered Moderation
The platform integrates a custom Python-based Neural Network (hosted on Render) that analyzes every review in real-time. This system:
* Detects and flags toxic or offensive content automatically.
* Performs sentiment analysis to categorize feedback.
* Ensures constructive criticism without manual intervention.

### 2. Multi-Layered Security
Security is a core pillar of the V2 architecture:
* **Geo-Fencing:** Access is restricted to Mexico via Cloudflare headers and Next.js Middleware to prevent foreign bot attacks.
* **Bot Protection:** Integrated Cloudflare Turnstile (Smart Captcha) to distinguish human users from automated scripts.
* **Fingerprinting:** Uses browser fingerprinting to limit review frequency per device without requiring user registration.
* **SSL/TLS Encryption:** Full Strict SSL enforcement between Client, Cloudflare, and Vercel.

### 3. High-Performance Architecture
* **Serverless Frontend:** Built with Next.js 14 (App Router) for static generation and server-side rendering.
* **Hybrid Backend:** Combines Vercel Serverless Functions for I/O operations and a dedicated Python Flask service for heavy AI processing.
* **Cron Jobs:** Automated background tasks update professor statistics (averages, difficulty) daily to reduce database load during peak traffic.

## Technical Stack

This project uses a decoupled architecture to maximize scalability and minimize costs.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 | React-based framework for routing, UI, and API routes. |
| **AI Engine** | Python (Flask) | Runs the sentiment analysis model and natural language processing. |
| **AI Hosting** | Render | Dedicated hosting for the Python service (prevents Vercel timeouts). |
| **Database** | Supabase | PostgreSQL database with Row Level Security (RLS). |
| **CDN & DNS** | Cloudflare | DNS management, DDoS protection, and Geo-IP handling. |
| **Deployment** | Vercel | CI/CD pipeline and frontend hosting. |
| **Validation** | Zod / TypeScript | Runtime schema validation for data integrity. |

## Project Structure

The project follows a standard Next.js App Router structure:

```text
unirait26/
├── app/
│   ├── api/                 # Serverless API routes (Internal API)
│   │   ├── cron/            # Scheduled tasks for stats updates
│   │   └── resenas/         # Review handling endpoints
│   ├── components/          # Reusable React components (Search, Cards)
│   ├── layout.js            # Main application wrapper
│   └── page.js              # Homepage entry point
├── public/                  # Static assets
```
Security Implementation Details
Middleware Configuration
The middleware.js file handles traffic filtering at the edge. It prioritizes the cf-ipcountry header provided by Cloudflare to validate the user's origin.

CORS & Communication
Communication between the Next.js frontend and the Python AI Backend is secured via strict CORS policies and internal API keys, preventing unauthorized use of the analysis engine.

License
This project is licensed under the MIT License.

Developed by a Semiconductor Engineering student at the University of Sonora.
├── middleware.js            # Request interception for Geo-Blocking
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
