# JobPortal — Full Stack Job Portal

A modern full-stack job portal that connects candidates and employers through a secure, role-based platform.

Candidates can discover, search, filter, save, and apply for jobs. Employers can create and manage job postings and view applicants. Administrators can monitor the platform, view system statistics, and import jobs from permitted public job sources through an admin-controlled scraping workflow.

---

## Live Application

### Frontend

https://jobportal-liart-one.vercel.app

### Backend API

https://jobportal-backend-sandy-psi.vercel.app

### API Documentation — Swagger

https://jobportal-backend-sandy-psi.vercel.app/api-docs

### Backend Health Check

https://jobportal-backend-sandy-psi.vercel.app/health

---

#  Features

## 👤 Candidate Features

Candidates can:

- Register an account
- Login securely
- Logout securely
- Browse available jobs
- Search jobs
- Filter jobs
- View complete job details
- Save/bookmark jobs
- Apply for jobs
- View submitted applications
- Manage their profile
- Access a personalized candidate dashboard

### Job Search and Filters

Candidates can search and filter jobs using:

- Job title
- Company
- Location
- Skills
- Work mode
- Employment type
- Experience level

Multiple filters can be combined with keyword search.

---

# 🏢 Employer Features

Employers can:

- Register as an Employer
- Login securely
- Create job postings
- Edit job postings
- Delete job postings
- Close job postings
- View their posted jobs
- View applicants
- Manage company information
- Access an Employer Dashboard

Employers can manage their complete job-posting lifecycle from the dashboard.

---

# 🛡️ Admin Features

The application includes a dedicated Admin Dashboard with role-based access control.

Admins have access to platform-level management and monitoring functionality.

## Admin Dashboard

The Admin Dashboard provides:

- Total users
- Total jobs
- Total companies
- Total applications
- Jobs scraped/added today
- Top job skills
- Top companies
- Top job locations

## Admin Job Scraper

Administrators can:

- Fetch jobs from supported public job sources
- Preview jobs before importing
- Select individual jobs for import
- Deselect jobs
- Edit job information before importing
- Import selected jobs
- Detect duplicate jobs
- Review import results

Fetching jobs creates a temporary preview and does not automatically save them to MongoDB.

Jobs are only persisted when the administrator explicitly imports them.

---

# 🔎 Job Scraping

The platform supports job aggregation from permitted public job sources.

## Supported Sources

Currently supported sources include:

- Remotive
- Jobicy

The scraper retrieves publicly available job information and converts it into the application's standard job format.

---

## Scraping Workflow

```text
Admin Login
     │
     ▼
Admin Dashboard
     │
     ▼
Scraper Preview
     │
     ▼
Fetch Jobs
     │
     ▼
Review Jobs
     │
     ▼
Select Jobs
     │
     ▼
Edit if Required
     │
     ▼
Import Selected Jobs
     │
     ▼
Duplicate Check
     │
     ▼
MongoDB
