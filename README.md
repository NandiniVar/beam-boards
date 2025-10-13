🎫 Ticket Dashboard

A mini project management dashboard inspired by Trello and Atlassian — featuring email-based OTP authentication, real-time ticket management, super-user controls, and live notifications for active users.

🚀 Features Overview
🧩 Authentication

Email-based OTP login (no passwords).

Post-login redirect to the main dashboard.

📁 Projects & Tickets

View all existing projects on the dashboard.

Create a new project if none exist.

Each project supports multiple tickets with title, description, and status.

Real-time synchronization: Any ticket movement or update instantly reflects for all active users.

Super-user toggle:

ON → Shows who created/updated each ticket.

OFF → Hides user details.

Turning ON requires entering a super-user password.

🔔 Notifications & Updates

Activity Feed: Displays all ticket updates in real time for active users.

UI Notifications: Shown instantly on the dashboard for online users.

Email Notifications: Sent to users who are offline when updates occur.

🧱 Tech Stack
🖥️ Frontend

Framework: React (with TypeScript) / Next.js

State Management: Zustand (lightweight and reactive)

Styling: Tailwind CSS

Key Features:

Project List & Project Detail Pages

Ticket Kanban Board (drag-and-drop functionality)

Super-user toggle modal with password input

Real-time notifications via WebSockets

Clean and minimal UI based on provided Figma design

⚙️ Backend

Framework: Node.js (with NestJS or Express + TypeScript)

Database: MongoDB (via Mongoose ORM)

Design Patterns Used:

Strategy Pattern for Notification System (UI vs Email strategy)

Factory Pattern for Ticket creation

Key Features:

Secure OTP-based login with email

Role-based control for Super-user

Real-time updates via Socket.io

Efficient DB schema for projects, tickets, users, and notifications
