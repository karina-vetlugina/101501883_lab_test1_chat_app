# COMP3133 Lab Test 1 - Chat Application

**Student Name:** Karina Vetlugina  
**Student ID:** 101501883  
**Course:** COMP3133  

---

## Project Overview
This project is a real-time chat application developed for **COMP3133 Lab Test 1**.  
The application allows users to register, log in, join chat rooms, and exchange real-time messages using **Socket.io**.  
All user accounts and chat messages are stored in **MongoDB** for persistence.

---

## Technologies Used
- Node.js
- Express.js
- Socket.io
- MongoDB Atlas + Mongoose
- HTML5 / CSS
- Bootstrap 5
- JavaScript (Fetch API)
- bcrypt (password hashing)

---

## Main Features
### User Authentication
- Users can sign up with a unique username.
- User information is saved in MongoDB.

### Login / Logout
- Users can log in using their username and password.
- User session is stored using **localStorage**.
- Logout clears localStorage and redirects back to login page.

### Room-Based Chat
- Users can join predefined rooms (devops, cloud computing, covid19, sports, nodeJS).
- Users can only chat inside the room they joined.
- Users can leave the current room anytime.

### Message Storage (MongoDB)
- Group messages are stored in MongoDB.
- When a user joins a room, previous messages are loaded from the database.

### Private Chat + Typing Indicator
- Users can send private messages to other users.
- Typing indicator displays “User is typing...” during 1-to-1 chat.
- Private messages are also stored in MongoDB.

---

## How to Run the Project

1. Install dependencies:
```bash
cd server
npm install