# Threx AI

Threx is a modern AI agent terminal system built with Next.js that leverages multiple AI providers (OpenAI, Claude, Perplexity) and is deployed on Railway for seamless cloud hosting.

## Key Features

- Multi-Model Integration: Seamlessly switch between OpenAI, Claude, and Perplexity APIs based on task requirements and user preferences
- Persistent Context Management: Store conversation history and agent state across sessions using Next.js API routes and database integration
- Terminal-Like Interface: Clean, responsive CLI-inspired UI with command history, autocomplete, and syntax highlighting
- Streaming Responses: Real-time streaming of AI responses for immediate feedback
Tool Connection Framework: Extensible system for connecting to external APIs, databases, and development tools
- Agent Memory & Knowledge Base: Maintain project-specific knowledge and previous interactions for contextual assistance
- Railway Deployment: One-click deployment with automatic scaling and environment management

## Technical Stack

- Frontend: Next.js with TypeScript for type safety
- Backend: Next.js API routes for serverless functions
- AI Integration: OpenAI, Anthropic Claude, and Perplexity APIs
- Database: Supabase
- Authentication: Privy auth
- Styling: Tailwind CSS for responsive terminal design
- Deployment: Railway for simplified cloud hosting

## Getting Started

- Clone the repository
- Install dependencies: pnpm install
- Set up environment variables in .env
- Run the development server: npm run dev
- Open http://localhost:3000 in your browser

## Deployment to Railway

- Install the Railway CLI: ``npm i -g @railway/cli``
- Login to Railway: ``railway login``
- Link your project: ``railway link``
- Deploy your application: ``railway up``

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.