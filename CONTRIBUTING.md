# Contributing to Seth Goldstein's Website

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- Git
- Basic knowledge of Astro, React, and Tailwind CSS

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/[your-username]/sethgoldstein.com.git
   cd sethgoldstein.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── PowersOfTen.astro      # Main biography component
│   ├── Timeline.tsx           # Interactive timeline
│   ├── GenerativeBackground.tsx # Particle animation
│   ├── ImageUploader.tsx      # File upload component
│   └── ...
├── pages/             # Astro pages (routes)
│   ├── index.astro    # Homepage
│   ├── upload.astro   # Image upload page
│   └── ...
├── layouts/           # Page layouts
├── styles/            # Custom CSS
└── lib/              # Utility functions
```

## 🎯 Types of Contributions

### 🐛 Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide screenshots if applicable
- Mention browser/device information

### 💡 Feature Requests
- Check existing issues first
- Clearly describe the feature
- Explain the use case and benefits
- Consider implementation complexity

### 🔧 Code Contributions
- Follow existing code patterns
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 💻 Development Guidelines

### Code Style
- **TypeScript/JavaScript**: Use modern ES6+ features
- **React Components**: Functional components with hooks
- **Astro Components**: Follow Astro best practices
- **CSS**: Use Tailwind CSS utilities primarily
- **File Naming**: Use kebab-case for files, PascalCase for components

### Component Guidelines
- Keep components focused and single-purpose
- Use TypeScript for type safety
- Follow the existing animation patterns
- Ensure responsive design compatibility
- Test across different screen sizes

### Styling Guidelines
- Prefer Tailwind CSS utilities over custom CSS
- Use consistent spacing (8px grid system)
- Maintain the black/white/blue color scheme
- Ensure proper contrast ratios for accessibility

## 🧪 Testing

### Manual Testing Checklist
- [ ] Test on mobile devices (responsive design)
- [ ] Test navigation between all pages
- [ ] Test interactive timeline functionality
- [ ] Test image upload if applicable
- [ ] Verify animations work smoothly
- [ ] Check performance on slower devices

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines above
   - Write clear, descriptive commit messages
   - Keep commits focused and atomic

3. **Test thoroughly**
   - Test all affected functionality
   - Check responsive design
   - Verify no regressions

4. **Update documentation**
   - Update README if needed
   - Add/update code comments
   - Update this CONTRIBUTING.md if relevant

5. **Submit pull request**
   - Use the PR template
   - Link related issues
   - Provide clear description of changes
   - Include screenshots for UI changes

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Manual testing performed
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Descriptive commit messages

## 🚫 What Not to Contribute

- Major architectural changes (discuss first)
- Breaking changes without prior discussion
- Code that significantly impacts performance
- Features that conflict with the site's purpose
- Unauthorized branding or content changes

## 🔒 Security Considerations

- Never commit API keys or secrets
- Be cautious with user-generated content
- Follow secure coding practices
- Report security issues privately

## 📞 Getting Help

- **General Questions**: Open a GitHub issue
- **Development Help**: Check existing issues or start a discussion
- **Direct Contact**: sethgoldstein@gmail.com

## 🎖️ Recognition

Contributors will be acknowledged in:
- GitHub contributors list
- Release notes for significant contributions
- Optional mention in README

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Respect differing viewpoints and experiences

### Enforcement
Unacceptable behavior may result in:
- Warning
- Temporary ban from project
- Permanent ban in severe cases

## 🔄 Release Process

1. Changes are reviewed and merged to main branch
2. Automated deployment to staging environment
3. Manual testing and approval
4. Deployment to production via Netlify

---

Thank you for contributing to Seth Goldstein's website! Your efforts help create a better experience for visitors and showcase the intersection of technology, art, and entrepreneurship.