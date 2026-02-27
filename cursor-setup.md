# Setting up sethgoldstein.com with Cursor

This guide will help you set up the Seth Goldstein website project in Cursor for local development.

## Prerequisites

1. **Install Cursor**: Download from [cursor.sh](https://cursor.sh)
2. **Install Node.js**: Version 18 or higher from [nodejs.org](https://nodejs.org)
3. **Install Git**: From [git-scm.com](https://git-scm.com)

## Setup Steps

### 1. Get the Code Locally

If you don't have the code on your local machine yet, you'll need to either:

**Option A: Download from this environment**
- Use your WebContainer's download feature to get all project files
- Extract to a local folder called `sethgoldstein.com`

**Option B: Clone from GitHub** (if already uploaded)
```bash
git clone https://github.com/[your-username]/sethgoldstein.com.git
cd sethgoldstein.com
```

### 2. Open in Cursor

```bash
# Navigate to your project folder
cd sethgoldstein.com

# Open in Cursor
cursor .
```

### 3. Install Dependencies

In Cursor's terminal:
```bash
npm install
```

### 4. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your Supabase credentials:
```env
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Start Development

```bash
npm run dev
```

Your site will be available at `http://localhost:4321`

## Cursor Features for This Project

### AI Assistance
- Use `Cmd+K` (Mac) or `Ctrl+K` (Windows) for inline AI help
- Use `Cmd+L` (Mac) or `Ctrl+L` (Windows) for chat with codebase context

### Recommended Extensions
Cursor will automatically suggest installing:
- Astro language support
- Tailwind CSS IntelliSense  
- Prettier code formatting
- TypeScript support

### Code Intelligence
- Full TypeScript support for `.tsx` components
- Astro component syntax highlighting
- Tailwind CSS autocomplete
- Automatic imports and refactoring

## Project Structure Overview

```
src/
├── components/           # React and Astro components
│   ├── PowersOfTen.astro        # Main biography
│   ├── Timeline.tsx             # Interactive timeline
│   ├── GenerativeBackground.tsx # Particle animation
│   ├── ImageUploader.tsx        # File uploads
│   └── ...
├── pages/               # Routes (file-based routing)
├── layouts/             # Page layouts
├── styles/              # Custom CSS
└── lib/                # Utilities
```

## Development Tips

### Working with Astro
- `.astro` files can mix HTML, CSS, and JavaScript
- Components can be Astro or React (`.tsx`)
- Server-side code goes in the frontmatter (`---`)

### Working with React Components
- Located in `src/components/`
- Use TypeScript for better development experience
- Import and use in `.astro` files with `client:load` directive

### Styling
- Uses Tailwind CSS for most styling
- Custom CSS in `src/styles/` when needed
- Responsive design with Tailwind breakpoints

### Database
- Uses Supabase for image uploads
- Migrations in `supabase/migrations/`
- Client setup in `src/lib/supabase.ts`

## Troubleshooting

### Port Already in Use
If port 4321 is busy:
```bash
npm run dev -- --port 3000
```

### Environment Variables
Make sure your `.env` file exists and has valid Supabase credentials.

### TypeScript Errors
Run the TypeScript checker:
```bash
npm run build
```

## Next Steps

1. **Make your first change** to see hot reloading work
2. **Use Cursor's AI features** to help with development
3. **Set up Git** for version control if not already done
4. **Deploy changes** using the build process

## Getting Help

- **Cursor Documentation**: [docs.cursor.sh](https://docs.cursor.sh)
- **Astro Documentation**: [docs.astro.build](https://docs.astro.build)
- **Project README**: See `README.md` for detailed project info