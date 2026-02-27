# Seth Goldstein Personal Website

A modern, interactive personal website showcasing Seth Goldstein's journey through technology, art, and entrepreneurship. Built with Astro, React, and Tailwind CSS.

## 🚀 Features

- **Interactive Timeline**: Navigate through Seth's career milestones from the 1980s to present
- **Powers of Ten Biography**: Multiple levels of biographical detail (1 word to 10,000 words)
- **Generative Background**: Interactive particle system with mouse interaction
- **Image Upload**: Community-driven image sharing via Supabase
- **Responsive Design**: Optimized for all device sizes
- **Modern Stack**: Built with Astro, React, Tailwind CSS, and Framer Motion

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) with React components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Supabase](https://supabase.com/)
- **Deployment**: [Netlify](https://netlify.com/)
- **Typography**: Space Grotesk font family

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/sethgoldstein.com.git
   cd sethgoldstein.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4321`

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── layouts/         # Page layouts
│   ├── pages/          # Route pages
│   ├── styles/         # Custom CSS
│   └── lib/            # Utility functions
├── supabase/
│   └── migrations/     # Database migrations
└── docs/               # Documentation
```

### Key Components

- **PowersOfTen.astro** - Main biography component with interactive sections
- **Timeline.tsx** - Interactive career timeline with animations
- **GenerativeBackground.tsx** - Particle system background
- **ImageUploader.tsx** - File upload functionality
- **Header.astro** - Navigation component
- **Footer.astro** - Footer with social links

## 🗄️ Database Setup

This project uses Supabase for data storage and image uploads.

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run migrations** (migrations are in `/supabase/migrations/`)
3. **Update environment variables** with your Supabase credentials

The database includes:
- Image storage bucket for community uploads
- Row Level Security (RLS) policies for safe data access

## 🎨 Customization

### Styling
- Primary styling uses Tailwind CSS
- Custom animations defined in `/src/styles/timeline.css`
- Color scheme focuses on black/white with blue accents

### Content
- Biography content is in `PowersOfTen.astro`
- Timeline data is in `Timeline.tsx`
- Media/press content is in respective page files

## 📱 Responsive Design

The site is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

## 🚢 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Manual Deployment
```bash
npm run build
# Upload contents of `dist` folder to your hosting provider
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style and patterns
- Test changes across different screen sizes
- Update documentation for significant changes
- Keep commits focused and descriptive

## 🔐 Environment Variables

Required environment variables:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Seth Goldstein - [@seth](https://twitter.com/seth) - sethgoldstein@gmail.com

Project Link: [https://github.com/[username]/sethgoldstein.com](https://github.com/[username]/sethgoldstein.com)

## 🙏 Acknowledgments

- [Astro](https://astro.build/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Supabase](https://supabase.com/) for backend services
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Netlify](https://netlify.com/) for seamless deployment