# dr.Xys

An AI-powered interactive medical intelligence and healthcare routing platform.

## Features

- **Interactive 3D Body Symptom Navigator**: Visual anatomy interface powered by Three.js and React Three Fiber.
- **Voice-Assisted Clinical Consultation**: Real-time voice interaction and clinical dialogue.
- **AI Medical Assistant**: Smart health triage and diagnosis powered by Google Gemini.
- **Hospital & Specialist Routing**: Leaflet-based interactive mapping and emergency care routing.
- **Medical Report Generation**: Automated clinical summaries and PDF report export with `@react-pdf/renderer`.
- **Fullstack Architecture**: React 19 frontend with Vite, Tailwind CSS, Express backend, and MongoDB database.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Three.js, Lucide Icons, Leaflet
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication
- **AI & Cloud**: Google Gemini API, Supabase, Clerk

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yashmangade-1923/dr.Xys.git
   cd dr.Xys
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env.local` in the root directory and configure your API keys.
   - Copy `backend/.env.example` to `backend/.env` and configure your database URI.

5. Run the application:
   ```bash
   # Start frontend
   npm run dev

   # Start backend (in another terminal)
   cd backend && npm start
   ```
