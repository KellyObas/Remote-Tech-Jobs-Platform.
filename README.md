# Remote Tech Jobs Platform

A production-ready job board platform for remote tech positions, built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

### For Developers
- Browse and search remote tech jobs
- Filter by tech stack, experience level, salary range, and employment type
- Apply to jobs with resume and cover letter
- Track all applications from a centralized dashboard
- Bookmark favorite jobs
- Manage profile with skills and portfolio

### For Employers
- Post unlimited job listings
- Manage company profile with logo and description
- View and manage applications
- Accept or reject applicants
- Edit and close job postings
- Dashboard with analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (Email/Password)

## Database Schema

The platform uses the following tables:
- `profiles` - User profiles with role-based access
- `companies` - Company information for employers
- `jobs` - Job postings
- `applications` - Job applications
- `bookmarks` - Saved jobs for developers

All tables have Row Level Security (RLS) enabled for data protection.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (database is already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card, etc.)
│   ├── Layout.tsx      # App layout with navigation
│   ├── ProtectedRoute.tsx
│   └── JobCard.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and configurations
│   └── supabase.ts
├── pages/             # Page components
│   ├── Home.tsx
│   ├── SignUp.tsx
│   ├── Login.tsx
│   ├── Jobs.tsx
│   ├── JobDetail.tsx
│   ├── DeveloperDashboard.tsx
│   ├── DeveloperProfile.tsx
│   ├── EmployerDashboard.tsx
│   ├── CompanyProfile.tsx
│   ├── CreateJob.tsx
│   ├── EditJob.tsx
│   └── JobApplications.tsx
├── types/             # TypeScript type definitions
│   └── database.ts
├── App.tsx            # Main app component with routing
└── main.tsx          # Application entry point
```

## Key Features Implementation

### Authentication
- Role-based signup (Employer or Developer)
- Email/password authentication via Supabase Auth
- Session persistence and management
- Protected routes based on user role

### Security
- Row Level Security (RLS) on all database tables
- Users can only access and modify their own data
- Employers can only view applications for their jobs
- Developers can only apply once per job

### User Experience
- Responsive design for mobile and desktop
- Real-time data updates
- Loading states and error handling
- Empty states for better UX
- Search and filter functionality

## Routes

### Public Routes
- `/` - Home page
- `/signup` - User registration
- `/login` - User login

### Developer Routes (Protected)
- `/developer/dashboard` - Developer dashboard
- `/developer/profile` - Edit profile
- `/jobs` - Browse jobs
- `/jobs/:id` - Job details and apply

### Employer Routes (Protected)
- `/employer/dashboard` - Employer dashboard
- `/employer/company` - Company profile
- `/employer/create-job` - Post new job
- `/employer/jobs/:id/edit` - Edit job
- `/employer/jobs/:id/applications` - View applications

## Database Migrations

The database schema is already set up. The migration file includes:
- Table definitions with proper constraints
- Row Level Security policies
- Indexes for optimized queries
- Triggers for automatic timestamp updates

## Deployment

### Supabase
The database is already deployed and configured.

### Frontend Deployment

The application can be deployed to any static hosting service:

1. **Vercel**
```bash
npm install -g vercel
vercel
```

2. **Netlify**
```bash
npm install -g netlify-cli
netlify deploy
```

3. **Build and deploy manually**
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## Environment Variables

Ensure these environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
