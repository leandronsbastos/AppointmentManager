# Overview

This is a comprehensive customer service platform built with React, Express, and TypeScript that provides ticket management, WhatsApp integration via Evolution API, and customer support features. The system is designed as a service desk solution with real-time communication, customer management, and reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Real-time**: WebSocket integration for live updates and notifications

## Backend Architecture
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Upload**: Multer middleware for handling file uploads
- **Real-time**: WebSocket server for live communication

## Database Design
The system uses a comprehensive schema with the following key entities:
- **Users**: Admin, manager, agent, and customer roles with team assignments
- **Customers**: Business and residential customer segments with contact information
- **Tickets**: Full lifecycle management with status, priority, and assignment tracking
- **Messages**: Multi-media message support (text, images, audio, documents) with delivery status
- **WhatsApp Integration**: Evolution API instances for WhatsApp communication
- **Support Features**: Tags, satisfaction surveys, knowledge articles, SLA policies, and team management

## Authentication & Authorization
- JWT token-based authentication stored in localStorage
- Role-based access control (admin, manager, agent, customer)
- Protected routes with middleware authentication
- Token verification for WebSocket connections

## File Structure
- **Monorepo Structure**: Shared schema and types between client and server
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory
- **Shared**: Common TypeScript definitions in `/shared` directory

# External Dependencies

## Core Technologies
- **React & TypeScript**: Frontend framework with type safety
- **Express.js**: Backend API server
- **Vite**: Frontend build tool and development server
- **Drizzle ORM**: Type-safe database operations with PostgreSQL

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **@neondatabase/serverless**: Database connection library

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **Shadcn/ui**: Pre-built component library
- **Recharts**: Data visualization and charts

## Real-time Communication
- **WebSocket (ws)**: Real-time bidirectional communication
- **Evolution API**: WhatsApp Business API integration for messaging

## Authentication & Security
- **JSON Web Tokens (jsonwebtoken)**: Stateless authentication
- **bcrypt**: Password hashing and security
- **Multer**: File upload handling

## Development Tools
- **Replit Integration**: Development environment with live preview
- **ESBuild**: Fast bundling for production builds
- **PostCSS & Autoprefixer**: CSS processing

## Data Management
- **TanStack Query**: Server state management and caching
- **Axios**: HTTP client for API requests
- **date-fns**: Date manipulation and formatting with Portuguese locale support