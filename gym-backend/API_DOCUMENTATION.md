# Gym Backend API Documentation

## Base URL
```
http://localhost:8020/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **Admin**: User with `userId: '0001'` (first registered user)
- **User**: All other registered users

---

## 1. AUTHENTICATION APIs

### 1.1 User Registration
```
POST /auth/register
```
**Access**: Public  
**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "postalCode": "12345",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "userId": "0001",
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St",
      "postalCode": "12345",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Note**: First user (0001) automatically becomes admin

### 1.2 User Login
```
POST /auth/login
```
**Access**: Public  
**Description**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**: Same as registration response

### 1.3 Get Current User Profile
```
GET /auth/me
```
**Access**: Protected (User/Admin)  
**Description**: Get current user's profile information

**Response**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "userId": "0001",
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St",
      "postalCode": "12345",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  }
}
```

### 1.4 Update User Profile
```
PUT /auth/profile
```
**Access**: Protected (User/Admin)  
**Description**: Update current user's profile

**Request Body**:
```json
{
  "name": "John Smith",
  "address": "456 Oak Ave",
  "postalCode": "54321"
}
```

**Response**: Updated user profile

### 1.5 Change Password
```
PUT /auth/change-password
```
**Access**: Protected (User/Admin)  
**Description**: Change current user's password

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### 1.6 Get All Users (Admin Only)
```
GET /auth/users
```
**Access**: Protected (Admin Only)  
**Description**: Get list of all registered users

**Response**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "total": 10
  }
}
```

### 1.7 Delete User (Admin Only)
```
DELETE /auth/users/:userId
```
**Access**: Protected (Admin Only)  
**Description**: Delete a user account

**Path Parameters**:
- `userId`: User's userId (e.g., "0002")

---

## 2. PRODUCT MANAGEMENT APIs

### 2.1 Add New Product (Admin Only)
```
POST /products
```
**Access**: Protected (Admin Only)  
**Description**: Add a new product to the system

**Request Body** (multipart/form-data):
```
name: "Whey Protein"
description: "High quality whey protein powder"
price: 29.99
category: "supplements"
stock: 100
image: [file upload - max 5MB]
```

**Product Categories**:
- `supplements`
- `equipment`
- `clothing`
- `accessories`
- `nutrition`

**Response**:
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "product": {
      "_id": "product_id",
      "name": "Whey Protein",
      "description": "High quality whey protein powder",
      "price": 29.99,
      "category": "supplements",
      "stock": 100,
      "image": "/uploads/products/product-1234567890.jpg",
      "isActive": true,
      "createdBy": "admin_user_id",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  }
}
```

### 2.2 Update Product (Admin Only)
```
PUT /products/:productId
```
**Access**: Protected (Admin Only)  
**Description**: Update existing product information

**Request Body** (multipart/form-data):
```
name: "Updated Product Name"
description: "Updated description"
price: 39.99
category: "equipment"
stock: 50
isActive: true
image: [optional file upload]
```

### 2.3 Delete Product (Admin Only)
```
DELETE /products/:productId
```
**Access**: Protected (Admin Only)  
**Description**: Delete a product and its associated image

### 2.4 Get All Products (Admin View)
```
GET /products/admin/all
```
**Access**: Protected (Admin Only)  
**Description**: Get all products including inactive ones

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `search`: Search in name/description
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: 'asc' or 'desc' (default: 'desc')

### 2.5 Get Single Product (Admin View)
```
GET /products/admin/:productId
```
**Access**: Protected (Admin Only)  
**Description**: Get detailed product information for admin

### 2.6 Get All Active Products (Public)
```
GET /products
```
**Access**: Public  
**Description**: Get all active products for customers

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category
- `search`: Search in name/description
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: 'asc' or 'desc' (default: 'desc')
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

### 2.7 Get Single Product (Public)
```
GET /products/:productId
```
**Access**: Public  
**Description**: Get product details for customers

### 2.8 Get Product Categories
```
GET /products/categories/list
```
**Access**: Public  
**Description**: Get list of all available product categories

---

## 3. APPOINTMENT MANAGEMENT APIs

### 3.1 Create Appointment (User)
```
POST /appointments
```
**Access**: Protected (User/Admin)  
**Description**: Create a new appointment request

**Request Body**:
```json
{
  "name": "John Doe",
  "age": 25,
  "problem": "Back pain",
  "doctorName": "Dr. Smith"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "_id": "appointment_id",
      "name": "John Doe",
      "age": 25,
      "problem": "Back pain",
      "doctorName": "Dr. Smith",
      "dateTime": null,
      "queueNumber": null,
      "status": "pending",
      "createdBy": "user_id",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  }
}
```

### 3.2 Get User Appointments
```
GET /appointments/my-appointments
```
**Access**: Protected (User/Admin)  
**Description**: Get current user's appointments

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `doctorName`: Filter by doctor name

### 3.3 Get Single User Appointment
```
GET /appointments/my-appointments/:appointmentId
```
**Access**: Protected (User/Admin)  
**Description**: Get specific appointment details

### 3.4 Delete User Appointment
```
DELETE /appointments/my-appointments/:appointmentId
```
**Access**: Protected (User/Admin)  
**Description**: Delete appointment (only if status is 'pending')

### 3.5 Get All Appointments (Admin)
```
GET /appointments/admin/all
```
**Access**: Protected (Admin Only)  
**Description**: Get all appointments in the system

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `doctorName`: Filter by doctor name
- `date`: Filter by date (YYYY-MM-DD)
- `search`: Search by name or problem

### 3.6 Get Single Appointment (Admin)
```
GET /appointments/admin/:appointmentId
```
**Access**: Protected (Admin Only)  
**Description**: Get appointment details by ID

### 3.7 Edit Appointment (Admin)
```
PUT /appointments/admin/:appointmentId
```
**Access**: Protected (Admin Only)  
**Description**: Update appointment dateTime, queueNumber, and status

**Request Body**:
```json
{
  "dateTime": "2024-01-15T10:00:00.000Z",
  "queueNumber": 5,
  "status": "confirmed"
}
```

**Appointment Statuses**:
- `pending` - Initial status
- `confirmed` - Admin confirmed with date/time
- `completed` - Appointment completed
- `cancelled` - Appointment cancelled

### 3.8 Get Appointments by Date (Admin)
```
GET /appointments/admin/by-date/:date
```
**Access**: Protected (Admin Only)  
**Description**: Get appointments for a specific date

**Path Parameters**:
- `date`: Date in YYYY-MM-DD format

**Query Parameters**:
- `doctorName`: Filter by doctor name

### 3.9 Get Next Queue Number (Admin)
```
GET /appointments/admin/next-queue/:date
```
**Access**: Protected (Admin Only)  
**Description**: Get next available queue number for a date

**Path Parameters**:
- `date`: Date in YYYY-MM-DD format

**Query Parameters**:
- `doctorName`: Filter by doctor name

---

## 4. BMI CALCULATION APIs

### 4.1 Calculate BMI
```
POST /bmi/calculate
```
**Access**: Protected (User/Admin)  
**Description**: Calculate BMI based on height and weight

**Request Body**:
```json
{
  "height": 175,
  "weight": 70
}
```

**Response**:
```json
{
  "success": true,
  "message": "BMI calculated successfully",
  "data": {
    "bmi": {
      "_id": "bmi_id",
      "height": 175,
      "weight": 70,
      "bmiValue": 22.86,
      "category": "Normal weight",
      "createdBy": "user_id",
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  }
}
```

**BMI Categories**:
- `Underweight`: < 18.5
- `Normal weight`: 18.5 - 24.9
- `Overweight`: 25.0 - 29.9
- `Obese`: ≥ 30.0

### 4.2 Get User BMI History
```
GET /bmi/history
```
**Access**: Protected (User/Admin)  
**Description**: Get current user's BMI calculation history

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

## 5. WORKOUT PLAN APIs

### 5.1 Create Workout Plan
```
POST /workout-plan
```
**Access**: Protected (User/Admin)  
**Description**: Create a new workout plan

**Request Body** (multipart/form-data):
```
title: "Beginner Workout"
description: "Simple workout for beginners"
difficulty: "beginner"
duration: "30 minutes"
image: [optional file upload]
```

**Difficulty Levels**:
- `beginner`
- `intermediate`
- `advanced`

### 5.2 Get All Workout Plans
```
GET /workout-plan
```
**Access**: Public  
**Description**: Get all workout plans

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `difficulty`: Filter by difficulty level
- `search`: Search in title/description

### 5.3 Get Single Workout Plan
```
GET /workout-plan/:planId
```
**Access**: Public  
**Description**: Get specific workout plan details

---

## 6. DATA STRUCTURES

### User Object
```json
{
  "_id": "ObjectId",
  "userId": "String (unique, auto-generated)",
  "name": "String (required)",
  "email": "String (required, unique)",
  "address": "String (required)",
  "postalCode": "String (required)",
  "password": "String (hashed, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Product Object
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "description": "String (required)",
  "price": "Number (required, min: 0)",
  "category": "String (required, enum)",
  "image": "String (required, file path)",
  "stock": "Number (required, min: 0)",
  "isActive": "Boolean (default: true)",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Appointment Object
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "age": "Number (required, 1-120)",
  "problem": "String (required)",
  "doctorName": "String (required)",
  "dateTime": "Date (nullable)",
  "queueNumber": "Number (nullable)",
  "status": "String (enum, default: 'pending')",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### BMI Object
```json
{
  "_id": "ObjectId",
  "height": "Number (required, cm)",
  "weight": "Number (required, kg)",
  "bmiValue": "Number (calculated)",
  "category": "String (calculated)",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date"
}
```

### Workout Plan Object
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "difficulty": "String (required, enum)",
  "duration": "String (required)",
  "image": "String (optional, file path)",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 7. ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Missing/Invalid Token)
- `403` - Forbidden (Admin Access Required)
- `404` - Not Found
- `500` - Internal Server Error

---

## 8. AUTHENTICATION FLOW

1. **Register** a new user account
2. **Login** with email and password to get JWT token
3. **Include token** in Authorization header for protected routes
4. **Token expires** after 7 days (need to login again)

---

## 9. ADMIN PRIVILEGES

Users with `userId: '0001'` automatically get admin access:
- Manage all users
- CRUD operations on products
- Manage all appointments
- Assign appointment dates and queue numbers
- View system-wide data

---

## 10. FILE UPLOADS

### Supported Formats
- **Images**: JPG, PNG, GIF, etc.
- **Max Size**: 5MB per file
- **Storage**: `uploads/products/` directory

### Image URLs
Uploaded images are accessible at:
```
http://localhost:8020/uploads/products/filename.jpg
```
