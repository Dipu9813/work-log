# Work Logs Tracking App

A comprehensive work logs tracking application built with Next.js, TypeScript, Tailwind CSS, and Supabase for event management, task assignment, planning boards, and work log tracking.

## 🚀 Features

### Core Features
- **Event Creation & Management** - Create and manage various organizational events (stalls, seminars, workshops, fundraisers)
- **Task Assignment System** - Assign tasks to team members with priority levels and deadlines
- **Planning/Ideation Board** - Collaborative brainstorming space for each event
- **Individual Work Log Submission** - Track daily work progress with optional time tracking and file attachments
- **Dashboard with Progress Tracking** - Visual overview of events, tasks, and team performance
- **User Authentication & Role Management** - Admin, Member, and Viewer roles with appropriate permissions

### Pages & Functionality
- **Dashboard** - Overview with stats cards, recent events, and activity feed
- **Events Page** - List and manage all events with status tracking
- **Event Detail Page** - Task management, planning board, and work logs for specific events
- **Work Logs Page** - Submit and view work logs across all events
- **Team Management** - Manage team members and their roles

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives

## 📊 Database Schema

The application uses the following main tables:

### Events Table
- `id` (UUID, Primary Key)
- `name` (Text, Event name)
- `date` (Date, Event date)
- `description` (Text, Event description)
- `created_by` (UUID, Foreign Key to profiles)
- `created_at`, `updated_at` (Timestamps)

### Tasks Table
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key to events)
- `assigned_to` (UUID, Foreign Key to profiles)
- `task_name` (Text, Task description)
- `priority` (Enum: low, medium, high)
- `status` (Enum: pending, in_progress, completed)
- `deadline` (Date, Task deadline)
- `created_at`, `updated_at` (Timestamps)

### Ideas Table
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key to events)
- `person_name` (Text, Contributor name)
- `idea_text` (Text, Idea description)
- `created_at` (Timestamp)

### Work Logs Table
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key to events)
- `task_id` (UUID, Foreign Key to tasks, optional)
- `person` (Text, Person name)
- `description` (Text, Work description)
- `hours_spent` (Decimal, Time spent)
- `attachment_path` (Text, File attachment path)
- `created_at` (Timestamp)

### Profiles Table
- `id` (UUID, Primary Key, linked to auth.users)
- `email` (Text, User email)
- `full_name` (Text, Full name)
- `avatar_url` (Text, Profile picture)
- `role` (Enum: admin, member, viewer)
- `created_at`, `updated_at` (Timestamps)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy the SQL schema from `supabase-schema.sql` and run it in your Supabase SQL editor

3. **Configure Environment Variables**
   
   Update the `.env.local` file with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 📱 Usage

### For Admins/Organizers:
1. **Create Events** - Set up new events with dates and descriptions
2. **Assign Tasks** - Add tasks and assign them to team members
3. **Monitor Progress** - View dashboard analytics and work logs
4. **Manage Team** - Add/remove team members and assign roles

### For Team Members:
1. **View Assigned Tasks** - See your tasks across all events
2. **Submit Work Logs** - Record your daily work with optional time tracking
3. **Contribute Ideas** - Add suggestions to the planning board
4. **Update Task Status** - Mark tasks as in progress or completed

### For Viewers:
1. **View Events** - See all events and their details
2. **Browse Work Logs** - View work progress across the organization

## 🔧 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── events/            # Event management pages
│   ├── work-logs/         # Work logs page
│   ├── team/              # Team management page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components (navbar)
│   ├── dashboard/         # Dashboard components
│   └── events/            # Event-related components
├── lib/                   # Utility functions
│   └── supabase.ts        # Supabase client configuration
└── types/                 # TypeScript type definitions
    └── supabase.ts        # Database type definitions
```

## 🚀 Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js:

1. **Deploy to Vercel** (Recommended)
   - Connect your repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

2. **Other Platforms**
   - Build the application: `npm run build`
   - Deploy the `.next` folder and `public` assets
   - Ensure environment variables are properly set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

For questions or support, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**
