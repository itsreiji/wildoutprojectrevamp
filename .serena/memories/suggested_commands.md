# WildOut! Suggested Commands

## Development Workflow

### Project Setup
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm type-check` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without writing
- `pnpm lint:parallel` - Run lint, type-check, and format-check in parallel
- `pnpm lint:all` - Run all quality checks (lint + type-check + format)

### Testing
- `pnpm test` - Run all tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:watch` - Run tests in watch mode

### File Search & Navigation
- `glob "app/**/page.tsx"` - Find all page components
- `glob "components/**/*.tsx"` - Find all UI components
- `glob "services/*.ts"` - Find all service files
- `search_file_content pattern="<term>"` - Search for content in files

### Git Commands
- `git status` - Check git status
- `git add <file>` - Stage changes
- `git commit -m "message"` - Commit changes
- `git push` - Push to remote
- `git pull` - Pull from remote
- `git checkout -b <branch>` - Create new branch
- `git branch` - List branches

### System Commands (macOS/Darwin)
- `ls` - List directory contents
- `cd <path>` - Change directory
- `pwd` - Print working directory
- `mkdir <dir>` - Create directory
- `rm <file>` - Remove file
- `cp <src> <dest>` - Copy file
- `mv <src> <dest>` - Move/rename file
- `grep "pattern" <file>` - Search for pattern in file
- `find <path> -name "pattern"` - Find files by name
- `cat <file>` - Display file contents
- `open <file>` - Open file with default application

### Next.js Specific
- `npx next dev` - Alternative dev server start
- `npx next build` - Alternative build command
- `npx next start` - Alternative production start

### Supabase Commands
- `supabase start` - Start local Supabase
- `supabase stop` - Stop local Supabase
- `supabase status` - Check Supabase status
- `supabase db reset` - Reset database
- `supabase migration new <name>` - Create new migration
- `supabase migration up` - Apply migrations
- `supabase migration down` - Revert migrations