# Stijoi Stephen Taxi Millionaire App

A Next.js application for tracking Tesla taxi rides and progress towards a €1,000,000 goal.

## Project Overview

This application helps Stijoi Stephen track his progress as a Tesla taxi driver towards his goal of achieving €1,000,000 in revenue. The app includes:

- User authentication for secure access
- Dashboard with progress tracking
- Ride entry and management
- Earnings statistics and reporting

## Technologies Used

- Next.js 12.3
- React 17
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- JWT Authentication

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/rahulbala1799/taxi.git
   cd taxi
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/taxi_db?schema=public"
     JWT_SECRET="your-secret-key"
     ```

4. Initialize your database:
   ```
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```
   npm run dev
   ```

## Deploying to Vercel

1. Create a PostgreSQL database (you can use Vercel Postgres, Supabase, or any other provider)

2. Push to GitHub:
   ```
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. Connect your GitHub repository to Vercel

4. Set up the environment variables in Vercel:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure secret key for JWT authentication

5. Deploy the application

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Track progress towards the €1,000,000 goal
- **Ride Management**: Add, view, edit, and delete ride details
- **Statistics**: View daily, weekly, and monthly earnings
- **Progress Visualization**: Visual representation of progress towards goal

## Database Schema

- **User**: Driver information and authentication details
- **Ride**: Individual taxi ride details including fare, distance, etc.
- **DailyStats**: Aggregated daily statistics for quick dashboard loading

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### Rides
- `GET /api/rides` - Get all rides
- `POST /api/rides` - Create a new ride

## Database Schema

- User: Handles user accounts, both passengers and drivers
- Ride: Stores information about taxi rides
- Vehicle: Stores information about taxis 