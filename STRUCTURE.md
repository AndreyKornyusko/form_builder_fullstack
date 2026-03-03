# Form Builder — Project Structure

form-builder/
├── .claude/                          # Claude Code agent configuration
│   ├── CLAUDE.md                     # Main agent instructions (project context)
│   ├── commands/                     # Custom slash commands for Claude Code
│   │   ├── implement-spec.md         # /implement-spec command
│   │   ├── run-checks.md             # /run-checks command
│   │   └── review-spec.md            # /review-spec command
│   └── agents/                       # Sub-agent configs (multi-agent)
│       ├── backend-agent.md
│       ├── frontend-agent.md
│       └── db-agent.md
│
├── specs/                            # SDD — all feature specs live here
│   ├── 00-architecture.md            # System-level architecture decisions
│   ├── 01-auth.md                    # Authentication spec
│   ├── 02-forms-crud.md              # Admin CRUD for forms
│   ├── 03-form-editor.md             # Form editor + preview + sidebar
│   ├── 04-public-forms.md            # Public list + form fill + modal
│   ├── 05-ai-agent.md                # AI chat agent (bonus)
│   └── 06-database-schema.md        # Prisma schema spec
│
├── app/                              # RemixJS app
│   ├── routes/
│   │   ├── _index.tsx                # Public: form list
│   │   ├── forms.$id.tsx             # Public: fill form
│   │   ├── admin._index.tsx          # Admin: dashboard
│   │   ├── admin.forms.new.tsx       # Admin: create form
│   │   ├── admin.forms.$id.edit.tsx  # Admin: edit form
│   │   └── auth.login.tsx            # Auth: login page
│   ├── components/
│   │   ├── form-editor/              # Editor components
│   │   ├── form-preview/             # Preview components
│   │   ├── form-fields/              # Field type renderers
│   │   ├── ai-chat/                  # AI agent chat UI
│   │   └── ui/                       # Shared MUI wrappers
│   ├── models/                       # Prisma DB operations
│   ├── services/
│   │   ├── auth.server.ts
│   │   ├── forms.server.ts
│   │   └── ai-agent.server.ts
│   ├── utils/
│   │   ├── session.server.ts
│   │   └── validation.ts             # Yup schemas
│   └── root.tsx
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
├── docker-compose.yml
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md
