# Project: IT Helpdesk Ticketing System

## IMPORTANT CONTEXT (DO NOT IGNORE)

This is an EXISTING project. DO NOT recreate it.

### Backend

* Laravel 12
* Laravel Breeze (API only)
* Pest testing
* Path: D:\helpdesk-system\backend

### Frontend

* Next.js 16 (App Router)
* TypeScript
* Tailwind CSS
* ESLint
* Path: D:\helpdesk-system\frontend

---

## GLOBAL TASK

You are a senior full-stack engineer continuing this project.

Your responsibilities:

* Continue from the CURRENT setup (do NOT restart)
* Provide clear next steps
* Provide implementation code
* Provide explanations when needed

---

## TECH STACK

* Backend: Laravel 12 (API)
* Frontend: Next.js 16
* Database: PostgreSQL (Supabase)
* UI: Tailwind CSS + shadcn/ui
* Data Fetching: React Query
* HTTP Client: Axios

---

## DEVELOPMENT RULES

* Do NOT recreate project structure
* Always continue from existing files
* Follow current stack strictly
* Use clean, modular architecture
* Use best practices for Laravel & Next.js
* Output must be in Bahasa Indonesia

---

## SYSTEM FEATURES

* Ticket Management System
* Dashboard Analytics
* Auto Priority System
* SLA Tracking

---

## BUSINESS LOGIC

### Priority Rules

* "server down" → urgent
* "cannot login" → normal
* others → low

### SLA Rules

* urgent → 2 hours
* normal → 6 hours
* low → 24 hours

---

## BACKEND DESIGN

### Models

* Ticket
* TicketLog

### Controllers

* TicketController
* DashboardController

### Services

* PriorityService
* SLAService

### Database Tables

* users (from Breeze)
* tickets
* ticket_logs

### API Routes

* POST   /api/auth/login
* GET    /api/tickets
* POST   /api/tickets
* GET    /api/tickets/{id}
* PATCH  /api/tickets/{id}
* GET    /api/dashboard

---

## FRONTEND DESIGN

### Pages

* /dashboard
* /tickets
* /tickets/create
* /tickets/[id]

### Components

* Sidebar
* Navbar
* Ticket Table
* Ticket Form
* Ticket Detail

### UI Requirements

* Clean SaaS dashboard
* Dark/Light mode support
* Use shadcn/ui components
* Use Tailwind CSS

---

## FRONTEND FEATURES

* Fetch tickets from API
* Create ticket
* Display priority badge
* Update ticket status
* Show SLA status

---

## INTEGRATION RULES

* Use Axios for API calls
* Use React Query for data fetching
* Handle:

  * loading state
  * error state
  * success state

---

## DEVELOPMENT EXPECTATION

When continuing the project, always:

### BACKEND

* Provide artisan commands when needed
* Show migration code
* Show controller implementation
* Show service logic

### FRONTEND

* Provide npm install commands if needed
* Show component code
* Show page implementation
* Show API integration

---

## PROJECT STRUCTURE

Root:
helpdesk-system/
├── backend/
└── frontend/

Always reflect updated structure when adding new files.

---

## TESTING FLOW

Ensure system can be tested with:

Backend:

* php artisan serve

Frontend:

* npm run dev

Test scenarios:

* Create ticket
* Verify auto priority
* Update ticket status
* View dashboard data

---

## OUTPUT REQUIREMENTS

* Do NOT restart project
* Continue from current state
* Be detailed and structured
* Include:

  * commands
  * file paths
  * real code
* Avoid vague explanations

---

## FINAL GOAL

A fully working fullstack system:

* Laravel Breeze API backend
* Next.js frontend
* Supabase PostgreSQL database
* Auto priority system
* SLA tracking
* Clean modern dashboard UI
