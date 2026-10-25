# BookLeaf Assignment — Technical Approach

## Approach and Priorities

My primary goal was to build a functional author support platform with separate author and administrator experiences. I prioritised the core workflows: authentication, role-based access control, book information, support ticket creation, ticket conversations, status management, and real-time updates.

I used React with Vite for the frontend, Node.js and Express for the backend, MongoDB Atlas for data storage, and Socket.IO for real-time communication. I chose this stack because it supports rapid development, clear separation between frontend and backend, and event-driven ticket updates. JWT-based authentication and password hashing provide the foundation for protecting user accounts and restricting administrative operations.

## AI Integration

I integrated Google Gemini to assist with ticket categorisation, priority assignment, and suggested support responses. The response-generation workflow uses BookLeaf support knowledge, including royalty policies, ISBN issues, printing quality, distribution, and metadata updates, to guide suggested answers.

AI-generated responses are suggestions rather than automatic final replies, allowing administrators to review and edit them. I also implemented a fallback path for AI service failures so the ticket workflow can remain usable when the AI service is unavailable. API keys are configured through environment variables.

## Trade-offs

Given the assignment timeline, I focused on delivering the main workflows and deploying a working full-stack application rather than implementing every production-level feature. I prioritised practical functionality and a straightforward architecture over additional infrastructure such as message queues, extensive automated testing, and advanced monitoring.

The current implementation would benefit from broader automated test coverage, more comprehensive API documentation, stronger operational monitoring, and further validation of AI-generated responses.

## Production Roadmap

For production, I would expand automated unit, integration, and end-to-end tests; introduce structured logging and error monitoring; add rate limiting and stricter input validation; and review security controls and access permissions. I would also improve AI evaluation, prompt versioning, token usage monitoring, and cost controls. As usage grows, I would consider background jobs for expensive operations, database indexing and query optimisation, and more robust real-time delivery and retry mechanisms.

The application is deployed with a React frontend on Vercel, an Express backend on Render, and MongoDB Atlas for persistence. This provides a practical foundation for demonstrating the application's core functionality while leaving room for future scalability and reliability improvements.
