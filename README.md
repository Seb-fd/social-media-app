# Social Media App

A full-featured social media platform built with Next.js 14, featuring real-time notifications, @mentions, image uploads, and a responsive design.

---

## Preview

![Social Media App Preview](./public/preview.png)

---

## Features

- **Authentication** - Secure login/signup via Clerk with user synchronization to database
- **Posts** - Create, delete, and like posts with character limits (500 max)
- **Comments** - Threaded comments on posts with delete functionality
- **@Mentions** - Tag users in posts and comments with autocomplete suggestions
- **Follow System** - Follow/unfollow users with follower counts
- **Notifications** - Real-time notifications for likes, comments, follows, and mentions
- **Image Uploads** - Upload profile pictures and post images via UploadThing
- **Profiles** - Editable profiles with name, bio, location, and website
- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Optimistic UI** - Instant feedback on likes and interactions
- **Cursor Pagination** - Efficient infinite scroll for feeds
- **XSS Protection** - Input sanitization on all user-generated content
- **Error Handling** - Graceful error states with toast notifications

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Clerk](https://clerk.dev/) | Authentication & user management |
| [Prisma](https://www.prisma.io/) | Type-safe database ORM |
| [Neon](https://neon.tech/) | Serverless PostgreSQL |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Reusable UI components (Radix UI) |
| [UploadThing](https://uploadthing.com/) | File uploads |
| [date-fns](https://date-fns.org/) | Date formatting |
| [react-hot-toast](https://react-hot-toast.com/) | Toast notifications |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon or local)
- Clerk account
- UploadThing account

### Installation

```bash
# Clone the repository
git clone https://github.com/Seb-fd/social-media-app.git
cd social-media-app

# Install dependencies
npm install

# Generate Prisma client
npm run postinstall
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# UploadThing
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=...
```

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Open Prisma Studio (optional)
npx prisma studio
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── get-username/
│   │   ├── profile/image/
│   │   └── uploadthing/
│   ├── notifications/            # Notifications page
│   ├── post/[id]/                # Post detail page
│   ├── profile/[username]/       # User profile page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/Feed
├── actions/                      # Server Actions
│   ├── comment.action.ts         # Comment CRUD
│   ├── like.action.ts            # Like/unlike
│   ├── notifications.action.ts   # Notifications
│   ├── post.action.ts            # Post CRUD + mentions
│   ├── profile.action.ts         # Profile management
│   └── user.action.ts            # User sync + follow
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── CreatePost.tsx            # Post creation form
│   ├── LikeButton.tsx            # Like button with optimistic UI
│   ├── MentionInput.tsx         # Input with @autocomplete
│   ├── Navbar.tsx                # Navigation (server)
│   └── PostCard.tsx             # Post display card
├── lib/
│   ├── prisma.ts                # Prisma singleton
│   ├── sanitize.ts              # XSS protection
│   └── mentions.ts              # @mention extraction
└── types/
    └── index.ts                 # Shared TypeScript types
```

---

## Architecture Highlights

### Server Actions
All mutations use Next.js Server Actions for type-safe, secure operations. Actions handle validation, authorization, and database updates.

### Authentication Flow
1. Clerk handles auth UI and session management
2. On login, `syncUser()` creates/updates user in PostgreSQL
3. Clerk ID (`userId`) maps to internal database ID

### Notifications System
- Created automatically on likes, comments, follows, and mentions
- Polling every 10 seconds for unread count
- Supports marking as read and deletion

---

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Sebastian Florez**
Frontend Developer

[![GitHub](https://img.shields.io/badge/GitHub-Seb--fd?style=social&logo=github)](https://github.com/Seb-fd)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Juan%20Sebastian%20Flórez%20Delgado?style=social&logo=linkedin)](https://www.linkedin.com/in/juan-sebastián-flórez-delgado-15263b311)
