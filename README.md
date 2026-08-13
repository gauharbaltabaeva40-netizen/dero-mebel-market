# DERO MEBEL MARKET

DERO MEBEL MARKET is a bilingual Kazakh/Russian custom-furniture catalog for an Astana furniture company. It includes a responsive catalog, DERO AI’s zero-cost guided product discovery, room/style/dimension filters, product availability status, and audited direct Kaspi ordering links.

## Technology

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| Client          | React 19, Vite, Tailwind CSS 4, TypeScript |
| Server          | Express 4, tRPC 11, Node.js                |
| Data            | Drizzle ORM with MySQL/TiDB                |
| Tests           | Vitest                                     |
| Package manager | pnpm 10                                    |

## Local installation

Install Node.js **22 or newer** and pnpm **10** before starting. Clone the repository, install the locked dependency set, then create a local environment file.

```bash
git clone https://github.com/gauharbaltabaeva40-netizen/dero-mebel-market.git
cd dero-mebel-market
pnpm install --frozen-lockfile
touch .env
```

Add the variables listed below to `.env` with values for a local MySQL-compatible database and your development OAuth application. Never commit `.env`, database credentials, OAuth credentials, or API keys.

```bash
pnpm db:push
pnpm dev
```

The development server starts the Express API and Vite development middleware together. Open the URL printed in the terminal.

## Environment variables

| Variable                 | Required locally | Purpose                                                                   |
| ------------------------ | ---------------: | ------------------------------------------------------------------------- |
| `DATABASE_URL`           |              Yes | MySQL/TiDB connection string used by Drizzle ORM.                         |
| `JWT_SECRET`             |              Yes | Secret used to sign development-session cookies. Use a long random value. |
| `VITE_APP_ID`            |    Yes for OAuth | OAuth application identifier.                                             |
| `OAUTH_SERVER_URL`       |    Yes for OAuth | OAuth service base URL.                                                   |
| `OWNER_OPEN_ID`          |         Optional | Project owner identifier used by platform integrations.                   |
| `BUILT_IN_FORGE_API_URL` |         Optional | Platform service URL for configured integrations.                         |
| `BUILT_IN_FORGE_API_KEY` |         Optional | Platform service key for configured integrations.                         |

> DERO AI’s customer-facing recommendation flow is rule-based and does not require an LLM or an external vision API. Customer reference images stay in the browser for the zero-cost guided matching flow.

## Common commands

| Command        | Description                                              |
| -------------- | -------------------------------------------------------- |
| `pnpm dev`     | Start the local development server.                      |
| `pnpm check`   | Run TypeScript without generating output.                |
| `pnpm test`    | Run the Vitest suite once.                               |
| `pnpm build`   | Build the client and server for production.              |
| `pnpm db:push` | Generate and apply Drizzle migrations to `DATABASE_URL`. |
| `pnpm format`  | Format repository files with Prettier.                   |

## Database workflow

Schema changes begin in `drizzle/schema.ts`. After reviewing the generated SQL, run `pnpm db:push` against a local development database. Do not point this command at a production database without a reviewed backup and migration plan.

## Contributing

Create a feature branch from `main`, keep changes scoped, and run the quality checks before opening a pull request.

```bash
git checkout -b feature/short-description
pnpm check
pnpm test
```

Describe user-visible changes and include screenshots for interface work. Do not add fabricated customer reviews, ratings, product availability quantities, or credentials. For catalog changes, preserve the bilingual Kazakh/Russian fields and verify direct Kaspi ordering only for audited product URLs.

## Repository access

The repository is private. To collaborate, the repository owner can invite a GitHub username from **Settings → Collaborators**, then the collaborator should accept the invitation before cloning.

## License

This project is licensed under the MIT License. See `package.json` for the current project license declaration.
