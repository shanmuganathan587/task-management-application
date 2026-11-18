# TaskFlow — Task Management Application

Full-stack internship project using HTML, CSS, JavaScript, Node.js, Express and MySQL.

## Features
- User registration and login
- Password hashing with bcrypt
- JWT authentication and protected API routes
- Create, view, update and delete tasks
- Task statuses: pending, in progress, completed
- Due dates and status filter
- Users can access only their own tasks
- Responsive interface

## Run locally
1. Install Node.js 18+ and MySQL 8+.
2. Run `schema.sql` in MySQL Workbench.
3. Copy `.env.example` to `.env` and enter your MySQL credentials.
4. Set a long random value for `JWT_SECRET`.
5. Run `npm install`.
6. Run `npm start`.
7. Open http://localhost:3000.

## API
- GET `/api/health`
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/tasks` (JWT required)
- POST `/api/tasks` (JWT required)
- PUT `/api/tasks/:id` (JWT required)
- DELETE `/api/tasks/:id` (JWT required)

For protected endpoints, send `Authorization: Bearer <token>`.

## Deployment
This app serves the frontend from Express. Deploy the whole repository as one Node.js service (e.g. Railway), set variables from `.env.example`, and import `schema.sql` into the hosted MySQL database. Do not commit `.env`. Review and test before submission.
