## Development Commands

- **Start development server**: `npm run dev` (or `pnpm dev`, `yarn dev`, `bun dev`)
- **Build for production**: `npm run build`
- **Start production server**: `npm run start`
- **Lint code**: `npm run lint` (uses ESLint with Next.js config)
- **Format code**: Prettier is not configured; run `npx prettier --write .` if needed
- **Type checking**: `npx tsc --noEmit` (TypeScript is used; check via build step)
- **Run MCP server**: `python mcp_webdev_server.py` (provides tools for running npm scripts and checking project status)

## Project Structure

- `src/app`: Next.js App Router pages and route handlers
  - `src/app/page.tsx`: Home page with AI chat interface
  - `src/app/layout.tsx`: Root layout with custom fonts and metadata
  - `src/app/login/`: Login page and form components
  - `src/app/api/`: API routes (Supabase auth, quota, document processing, agent token)
- `src/components`: Reusable UI components (vault dashboard, cards, etc.)
- `src/lib`: Utility modules
  - `src/lib/supabase`: Supabase client, server, and middleware helpers
  - `src/lib/quota.ts`: Quota checking logic
  - `src/lib/rate-limit.ts`: Rate limiting implementation
  - `src/lib/vault-data.ts` & `vault-queries.ts`: Data fetching and Supabase queries
  - `src/lib/utils.ts`: General helper functions
- `src/proxy.ts`: Edge gateway for Lock 1 (Next.js 16) blocks non-compliant traffic + guards routes
- `mcp_webdev_server.py`: MCP Server for Web Development Tasks
- `public`: Static assets (favicon, etc.)
- `.env.example`: Template for Supabase environment variables

## Key Technologies

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS v4 with custom `@tailwindcss/postcss` setup
- **Authentication**: Supabase Auth (via `@supabase/ssr` and `@supabase/supabase-js`)
- **AI Integration**: 
  - `@21st-sdk/agent` and `@21st-sdk/nextjs` for agent chat
  - `@ai-sdk/react` and `ai` for AI SDK utilities
- **Database**: Supabase (PostgREST) – queries in `src/lib/vault-queries.ts`
- **TypeScript**: Strict configuration in `tsconfig.json`
- **Linting**: ESLint with `eslint-config-next`
- **MCP**: Model Context Protocol server (`mcp_webdev_server.py`) for web development tools

## Common Tasks

- **Adding a new page**: Create a folder under `src/app` with `page.tsx` (and optionally `loading.tsx`, `error.tsx`)
- **Creating an API route**: Add `route.ts` inside `src/app/api/<name>/`
- **Accessing Supabase**: Use `src/lib/supabase/server.ts` for server-side calls; `client.ts` for client-side (if needed)
- **Running MCP tools**: Use the MCP server to run npm scripts, list files, get package info, or check ports
- **Updating Tailwind config**: Edit `tailwind.config.ts` (not present; Tailwind v4 uses `globals.css` and postcss)
- **Environment variables**: Copy `.env.example` to `.env.local` and fill in Supabase URL/anon key, etc.

## Project Status (from agent.md)

- **PHASE 1: INFRASTRUCTURE (SQL SCHEMA & RLS)** - STATUS: DONE
- **PHASE 2: DESIGN SYSTEM (OBSIDIAN LEDGER)** - STATUS: DONE
- **PHASE 3: BENTO GRID DASHBOARD** - STATUS: DONE
- **PHASE 4: INTERACTION & BACKEND SYNC** - STATUS: DONE
- **AUTH: Supabase auth + live data wiring** - STATUS: DONE
- **PHASE A1: WORKSPACES + WORKSPACE-AWARE RLS + TIERED QUOTA** - STATUS: DONE
- **PHASE A2: /api/workspaces, APPROVALS, AUDIT ZIP, /api/webhooks** - STATUS: DONE
- **PHASE A3: 21st.dev UI (BENTO + WORKSPACE SWITCHER + APPROVAL QUEUE)** - STATUS: DONE

## Notes

- This project uses a custom agent chat UI (`AgentChat` from `@21st-sdk/nextjs`) – see `src/app/page.tsx`
- Authentication flows are in `src/app/login/`; protected routes rely on Supabase middleware (`src/lib/supabase/middleware.ts`)
- Before writing code, review `AGENTS.md` for important Next.js version‑specific caveats
- UI components are sourced via 21st.dev (magic MCP) as noted in agent.md
- The MCP server (`mcp_webdev_server.py`) provides tools for running npm scripts, list files, get package info, or check ports
- When `NEXT_PUBLIC_SUPABASE_*` are unset, the console runs in DEMO mode (simulated data, no auth gate)
- When set, enforces auth + live data via RLS (Row Level Security)