# NoteSphere

Welcome to **NoteSphere**, an innovative note-taking application designed for effortless organization and management of your thoughts and ideas.
Built using the robust MERN stack (MongoDB, Express.js, React.js, Node.js), NoteSphere combines sleek design with dynamic functionality to redefine productivity.

## Project Overview
NoteSphere is not just another note-taking app; it is your digital companion for managing ideas, tasks, and inspirations. 
It features a responsive and user-friendly interface, making it accessible across devices.

## Features
- **Effortless Note Management**: Add, edit, and delete notes seamlessly.
- **Real-time Updates**: Experience smooth performance with real-time data sync.
- **Organize with Tags: Use tags to categorize and quickly retrieve notes.
- **Search Notes: Instantly find notes using the search functionality.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- ** Secure Authentication: User authentication with JWT for secure access.
- ** Data Persistence: Store and retrieve notes from a MongoDB database.
- ** Edit and Delete: Modify and delete notes with a single click.

## Dataset Information
NoteSphere leverages dynamic storage mechanisms powered by MongoDB. No static dataset is required as users create and manage their data interactively.

## Requirements
Below are the prerequisites for running NoteSphere:
- **General Requirements**:
  - Node.js (v12+)
  - npm or yarn
  - MongoDB (local or cloud-based instance)
- **Key Libraries**:
  - React.js
  - Express.js
  - Context API
  - Other utilities like dotenv, cors, and bcrypt.

### Additional Recommendations
It is recommended to use the latest version of Node.js for better performance.

## Files Included
- **src/**: Source code for the application.
- **public/**: Contains static assets like the favicon and manifest file.
- **README.md**: This documentation file.
- **package.json**: Lists project dependencies.
- **.env.sample**: Template for environment variable configuration.

## How to Run the Project
This repository contains two separate apps: the React frontend in `notesphere/`
and the Express/MongoDB backend in `notesphere-backend/`. Each has its own
dependencies and environment file.

1. Clone the Repository:
   ```bash
   git clone https://github.com/AniketShewale08/NoteSphere.git
   cd NoteSphere
   ```

2. Set up and start the backend:
   ```bash
   cd notesphere-backend
   npm install
   cp .env   # then fill in the values (see below)
   npm run dev           # starts on http://localhost:5000
   ```
   Backend environment variables (`notesphere-backend/.env`):
   ```env
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000
   ```

3. Set up and start the frontend (in a second terminal):
   ```bash
   cd notesphere
   npm install
   cp .env   # optional; defaults to http://localhost:5000
   npm start             # starts on http://localhost:3000
   ```
   Frontend environment variables (`notesphere/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Open in Browser:
   Navigate to `http://localhost:3000` to access the application.

## Contributing
Contributions are welcome! Here’s how you can get involved:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Implemented feature XYZ"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.
