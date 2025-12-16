# Contributing to Gridlink

🚀 **Thank you for your interest in contributing to Gridlink!** We welcome contributions from the community.

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- GitHub account
- Code editor (VS Code recommended)

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gridlink.git
   cd gridlink
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Gzeu/gridlink.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

---

## 🛠️ Development Workflow

### Create a Feature Branch

```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Make Changes

1. Edit files in `src/`
2. Test your changes locally
3. Ensure no errors in console
4. Test on mobile (responsive design)

### Test Your Changes

```bash
# Run type checking
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

### Database Changes

If you modify `prisma/schema.prisma`:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

---

## 🎨 Code Style

### TypeScript
- Use **strict mode**
- Add types for all function parameters
- Use interfaces over types when possible
- Prefer `const` over `let`

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

const getUserById = async (id: string): Promise<User> => {
  // ...
};

// ❌ Bad
const getUserById = async (id) => {
  // ...
};
```

### React Components
- Use **functional components**
- Use **hooks** (useState, useEffect, etc.)
- Extract reusable logic into custom hooks
- Keep components small (<200 lines)

```typescript
// ✅ Good
export default function MyComponent({ title }: { title: string }) {
  const [count, setCount] = useState(0);
  return <div>{title}: {count}</div>;
}

// ❌ Bad
export default function MyComponent(props) {
  const [count, setCount] = useState(0);
  return <div>{props.title}: {count}</div>;
}
```

### Styling
- Use **Tailwind CSS** utility classes
- Avoid inline styles
- Group related classes together
- Use responsive prefixes (sm:, md:, lg:)

```tsx
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-slate-800 p-6">

// ❌ Bad
<div style={{ display: 'flex', gap: '16px' }}>
```

### File Naming
- **Components**: PascalCase (`UserCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Pages**: lowercase (`dashboard/page.tsx`)
- **API Routes**: lowercase (`api/users/route.ts`)

---

## 📝 Commit Guidelines

### Commit Message Format

Use **gitmoji** + semantic commit messages:

```
<emoji> <type>: <subject>

<body> (optional)
```

### Emoji Reference
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 📝 `:memo:` - Documentation
- 🚀 `:rocket:` - Performance improvement
- 🎨 `:art:` - UI/styling changes
- ♻️ `:recycle:` - Refactoring
- ✅ `:white_check_mark:` - Tests
- 🔒 `:lock:` - Security fix
- 💚 `:green_heart:` - CI/CD changes

### Examples

```bash
# ✅ Good commits
git commit -m "✨ Add real-time WebSocket support"
git commit -m "🐛 Fix dashboard stats not loading"
git commit -m "📝 Update API documentation"
git commit -m "🎨 Improve mobile responsive design"

# ❌ Bad commits
git commit -m "fixed bug"
git commit -m "update"
git commit -m "changes"
```

---

## 🚀 Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests**
   ```bash
   npm run lint
   npm run build
   ```

3. **Push to your fork**
   ```bash
   git push origin your-branch
   ```

### Creating the PR

1. Go to [Gridlink repository](https://github.com/Gzeu/gridlink)
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] Added tests (if applicable)

## Screenshots
(if UI changes)
```

### PR Review Process

1. Maintainer reviews your PR (usually within 48 hours)
2. Address any requested changes
3. Once approved, maintainer will merge
4. Your contribution will be in the next release! 🎉

---

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

- Check [existing issues](https://github.com/Gzeu/gridlink/issues)
- Try on the latest version
- Check documentation

### Submitting a Bug Report

1. Go to [Issues](https://github.com/Gzeu/gridlink/issues/new)
2. Select "Bug Report" template
3. Fill in all required fields:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.0.0]

**Screenshots**
(if applicable)
```

---

## ✨ Feature Requests

### Submitting a Feature Request

1. Go to [Issues](https://github.com/Gzeu/gridlink/issues/new)
2. Select "Feature Request" template
3. Describe your idea:

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How would you implement it?

**Alternatives**
Other approaches considered?

**Additional Context**
Screenshots, mockups, etc.
```

---

## 💬 Community Guidelines

- Be respectful and inclusive
- Help others learn
- Give constructive feedback
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🎉 Recognition

All contributors will be:
- Listed in [README.md](README.md)
- Mentioned in release notes
- Given credit for their work

---

## 💬 Questions?

- **GitHub Discussions**: [discussions](https://github.com/Gzeu/gridlink/discussions)
- **Twitter**: [@Gzeu_Dev](https://twitter.com/Gzeu_Dev)
- **Email**: contact@gridlink.io

---

**Thank you for contributing to Gridlink! 🚀**

**Built with ❤️ by the Gridlink community**
