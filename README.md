# BookLeaf — Author Support & Ticket Management System

A full-stack web application for BookLeaf authors to manage their books, raise support tickets, track ticket status, and communicate with the support team. Administrators can manage support requests, prioritize issues, and use AI-assisted responses.

## Live Demo

- **Frontend:** https://frontend-rouge-eight-3pafu3gsi1.vercel.app
- **Backend API:** https://book-leaf-dago.onrender.com
- **GitHub Repository:** https://github.com/manjityadav/Book-Leaf

## Features

### Author Portal
- Register and log in securely.
- View personal book details, publication status, sales, and royalties.
- Create support tickets and track their status.
- Reply to support conversations and view ticket history.
- Receive real-time ticket updates.

### Admin Portal
- View and manage support tickets from all authors.
- Filter and prioritize tickets.
- Generate AI-assisted ticket classifications and draft responses.
- Edit AI-generated responses before sending them.
- Update ticket status and add private internal notes.
- Assign and manage support requests.

### AI Assistance
- Automatically classify tickets into support categories.
- Assign priority levels: Critical, High, Medium, and Low.
- Generate suggested responses using BookLeaf's support knowledge base.
- Handle AI service failures with a fallback mechanism.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT, bcrypt |
| Real-time communication | Socket.IO |
| AI integration | Google Gemini API |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Project Structure

```text
Book-Leaf/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── ...
│   ├── app.js
│   ├── package.json
│   ├── seedData.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   └── ...
    ├── package.json
    └── .env.example
```

*The structure above highlights the main files; folder contents may vary.*

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or accessible MongoDB instance
- Google Gemini API key for AI features

### 1. Clone the repository

```bash
git clone https://github.com/manjityadav/Book-Leaf.git
cd Book-Leaf
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm start
```

The API should run at `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Overview

The backend exposes REST APIs for authentication, books, support tickets, replies, and administration.

| Base path | Purpose |
|---|---|
| `/api/auth` | Registration and login |
| `/api/auth/me` | Retrieve the authenticated user |
| `/api/books` | Author book data |
| `/api/tickets` | Author tickets and conversations |
| `/api/admin/tickets` | Admin ticket management and AI assistance |

Protected endpoints require valid authentication. Administrative operations require the appropriate role.

## Real-Time Communication

Socket.IO provides real-time ticket events, including new tickets, replies, and ticket updates. Authenticated users join the appropriate rooms so updates can be delivered to the relevant authors and administrators.

## Security

- Passwords are hashed before storage.
- JWT authentication protects private endpoints.
- Role-based access control separates author and admin operations.
- Authors can access only their own protected data.
- Environment variables are used for secrets and deployment configuration.

## Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** MongoDB Atlas.

Configure the production environment variables in the respective hosting dashboards. Set `CLIENT_URL` to the exact deployed frontend origin, without a trailing slash, and configure the frontend API and Socket.IO URLs to point to the deployed backend.

## Demo Access

Use the demo accounts configured in the database or create an author account through registration.

- **Author demo:** `priya.sharma@email.com`
- **Author demo password:** `BookLeafDemo@2026`
- **Admin demo:** `author2@example.com`
- **Admin demo password:** `TestPass123!`

## Future Improvements

- Automated tests for API endpoints and role permissions.
- More comprehensive API documentation.
- Enhanced ticket analytics and reporting.
- Improved AI response evaluation and monitoring.

---

**Developed by Manjeet Kumar Yadav**

A full-stack project demonstrating authentication, role-based access control, REST API development, real-time communication, database integration, AI-assisted workflows, and cloud deployment.
