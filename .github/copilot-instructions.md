<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Next.js Project Instructions

This is a Next.js project with TypeScript, Tailwind CSS, and App Router configuration. When generating code:

## General Guidelines

- Use TypeScript for all components and utilities
- Follow Next.js 14+ App Router conventions
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Follow React functional component patterns with hooks

## File Structure

- Components go in `src/components/`
- Pages use App Router in `src/app/`
- Utilities go in `src/lib/`
- Types go in `src/types/`

## Styling

- Use Tailwind CSS utility classes
- Implement mobile-first responsive design
- Use semantic HTML elements
- Follow accessibility best practices

## Deployment

- This project is configured for easy deployment to Vercel
- Environment variables should be prefixed with `NEXT_PUBLIC_` for client-side usage
- Use Next.js built-in optimization features (Image, Link, etc.)
