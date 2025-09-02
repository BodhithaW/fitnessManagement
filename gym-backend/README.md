# Gym Backend API

A Node.js backend API for gym management system built with Express.js and MongoDB.

## Features

- RESTful API endpoints
- MongoDB database integration
- User management (CRUD operations)
- Security middleware (Helmet, CORS)
- Request logging (Morgan)
- Environment variable configuration
- Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gym-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=8020
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/gymDB?retryWrites=true&w=majority
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (if configured)

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Server health status

## Project Structure

```
gym-backend/
├── src/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── controllers/
│   │   └── userController.js  # User CRUD operations
│   ├── models/
│   │   └── User.js        # User data model
│   ├── routes/
│   │   ├── index.js       # Main routes
│   │   └── userRoutes.js  # User routes
│   └── server.js          # Main server file
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Database Schema

### User Model
- `name` (String, required) - User's full name
- `email` (String, required, unique) - User's email address
- `password` (String, required) - User's password
- `role` (String, enum) - User role (user, admin, trainer)
- `isActive` (Boolean) - Account status
- `timestamps` - Created and updated timestamps

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation
- Error handling middleware
- Environment variable protection

## Development

The server runs on port 8020 by default. You can change this by modifying the `PORT` environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.


Add New Product
'supplements', 'equipment', 'clothing', 'accessories', 'nutrition'