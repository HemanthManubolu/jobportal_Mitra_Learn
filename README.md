# JobPortal

A MERN job portal with server-enforced candidate, employer, and administrator roles. The existing React/Vite UI is retained; employer tooling now lives under `/employer`, while `/admin/dashboard` is reserved for administrators.

## Features

- Candidates search, filter, sort, paginate, save jobs, apply once, manage their profile/resume, and view applications.
- Employers manage only their own companies, jobs, applicants, and application decisions.
- Administrators view platform metrics, users, companies, jobs, applications, and run the permitted public-source importer.
- Cookie/Bearer JWT authentication, RBAC, ownership checks, request throttling, MongoDB indexes, error responses, and optional Cloudinary uploads.

## Architecture and data

`frontend/` is React + Vite + Redux + Tailwind. `backend/` is Express + Mongoose. MongoDB collections are `users`, `companies`, `jobs`, `applications`, and `savedjobs`. Important uniqueness constraints include email, application `(job, applicant)`, saved job `(user, job)`, and scraped job `(source, sourceUrl)`.

The Job document supports title, company reference, location, work mode, employment type, salary, experience, skills, description, requirements, benefits, deadline, positions, lifecycle status, creator, and source metadata.

### Roles and dashboards

- **Candidate:** browse/search/filter/sort jobs, save jobs, apply once, update a profile/resume, and use `/candidate/dashboard` for live application and saved-job totals.
- **Employer:** owns companies and job listings only; `/employer/dashboard` contains only that employer's job and applicant totals, recent jobs, and recent applications.
- **Admin:** is created only with the server-side command and can access platform statistics and paginated management endpoints. Public registration rejects the `admin` role.

The backend enforces JWT authentication, role checks, and ownership checks on every protected endpoint. Expired/closed jobs cannot be applied to. A deleted job also removes associated saved-job and application records.

### REST API

Public job queries support `search`, `location`, `workMode`, `employmentType`, `experienceLevel`, `skills`, `minSalary`, `maxSalary`, `status`, `page`, `limit`, `sortBy`, and `sortOrder`. Limits are capped at 100 and sorting is whitelisted. The canonical endpoints are documented at `/api-docs`; the original singular routes remain for UI compatibility.

Admin collection endpoints (`/admin/users`, `/admin/jobs`, `/admin/companies`, `/admin/applications`) are paginated with `page` and `limit`. Password hashes are never returned. Import the Postman collection to exercise candidate, employer, and admin requests with `{{baseUrl}}`, `{{token}}`, `{{jobId}}`, `{{companyId}}`, and `{{applicationId}}` variables.

## Install and run

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Use `npm run build` in `frontend` for the production build and `npm start` in `backend` for production startup. Run `npm run migrate:roles` in `backend` once when upgrading a database containing the legacy `student` and `recruiter` role values. Create the first administrator only from the backend environment with `npm run create:admin`; public registration intentionally cannot create admins.

## Environment

Backend: `MONGO_URI`, `SECRET_KEY`, `CLIENT_URL`, `PORT`, `NODE_ENV`, optionally `JWT_EXPIRES_IN`, `CLOUD_NAME`, `API_KEY`, and `API_SECRET`. Frontend: `VITE_API_URL`, e.g. `https://api.example.com/api/v1`. Do not commit `.env` files.

## API and deployment

The clean API is under `/api/v1`; legacy singular endpoints remain to avoid breaking the original UI. Swagger UI is served from `/api-docs` and OpenAPI JSON from `/api-docs.json`. Import [postman/JobPortal.postman_collection.json](postman/JobPortal.postman_collection.json) into Postman.

Deploy the frontend to Vercel (set `VITE_API_URL`) and the backend to Render/Railway/AWS (set `CLIENT_URL` to the deployed frontend). Use MongoDB Atlas, allow the backend's network address, and use HTTPS in production so the secure cross-site auth cookie works.

## Scraping

`POST /api/v1/scrape/jobs` is admin-only. It imports configured permitted public feeds (currently Remotive and Jobicy), normalizes records into Job/Company documents, and reports additions, skipped duplicates, and errors. It does not bypass authentication, robots controls, or anti-bot systems. Scheduling is intentionally left to the host scheduler rather than adding a runtime dependency.

Scraped jobs are marked `isAggregated: true`, use the invoking admin as their safe system creator, and are unique by `source + sourceUrl`. Public-source logo URLs are stored only as company logos—never as websites. Configure an external platform scheduler to call the protected scraper endpoint no more often than hourly, respecting the configured sources' published rate guidance.

## Deployment checklist

For Vercel, set `VITE_API_URL` to the deployed backend's `/api/v1` URL. For Render, Railway, or AWS, set `MONGO_URI`, a long random `SECRET_KEY`, and `CLIENT_URL` to the deployed frontend origin. `NODE_ENV=production` enables secure, cross-site JWT cookies; HTTPS is required. Use MongoDB Atlas as the production database—MongoDB is explicitly permitted by the assessment—and set Cloudinary variables only if uploads are enabled. No live deployment is included in this repository.
