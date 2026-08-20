# Maddy's Tattoo & Art — Backend API

This is the production-ready Node.js backend foundation for Maddy's Tattoo & Art platform.

## Requirements
- Node.js (v20+ recommended)
- PostgreSQL (v14+ recommended)

## Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your actual configurations (especially the `DATABASE_URL`).

## PostgreSQL Setup Requirement
This project does not use Docker. You must have PostgreSQL running on your machine or accessible via a network.

## Database Setup
1. Ensure your PostgreSQL instance is running.
2. Run Prisma migrations to set up the database schema:
   ```bash
   npm run prisma:migrate
   ```
3. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```

## Development
To start the development server with live reload:
```bash
npm run dev
```

## Production Build
To build the project for production:
```bash
npm run build
```
Then start it:
```bash
npm start
```

## Migration Commands
- **Run migrations in development:** `npm run prisma:migrate`
- **Apply migrations in production:** `npm run prisma:deploy`
- **Open Prisma Studio:** `npm run prisma:studio`
