# API Data Contract & Documentation

**Backend Base URL**: `http://localhost:8080/api`  
**Frontend Client**: ReactJS + Vite (`http://localhost:5173`)  
**Protocol**: HTTP/1.1  
**Data Format**: JSON (`application/json`)  
**Security**: Spring Security + Stateless JWT (`Authorization: Bearer <token>`)  

---

## Overview of Endpoints

| Method | Endpoint URL | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and return JWT token | No |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT token | No |
| `GET` | `/api/home` | Health check / greeting service | No |
| `GET` | `/api/users` | Fetch list of all registered users (passwords omitted) | No |
| `POST` | `/api/requests` | Create a new service request for authenticated user | **Yes (Bearer JWT)** |
| `GET` | `/api/requests` | Fetch all service requests created by authenticated user | **Yes (Bearer JWT)** |
| `GET` | `/api/requests/{id}` | Fetch specific service request by ID (owner only) | **Yes (Bearer JWT)** |
| `PUT` | `/api/requests/{id}` | Update existing service request by ID (owner only) | **Yes (Bearer JWT)** |
| `DELETE` | `/api/requests/{id}` | Delete service request by ID (owner only) | **Yes (Bearer JWT)** |

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **HTTP Method**: `POST`
- **Endpoint URL**: `http://localhost:8080/api/auth/register`
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecretPassword123!"
}
```
- **201 Created Response**:
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "message": "Registration successful!"
}
```

---

### 1.2 User Login
- **HTTP Method**: `POST`
- **Endpoint URL**: `http://localhost:8080/api/auth/login`
- **Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "SecretPassword123!"
}
```
- **200 OK Response**:
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "message": "Login successful!"
}
```

---

## 2. Service Request Module (Protected Endpoints)

All requests below require the header:
```http
Authorization: Bearer <jwt_token>
```

### 2.1 Create Service Request
- **HTTP Method**: `POST`
- **Endpoint URL**: `http://localhost:8080/api/requests`
- **Request Body**:
```json
{
  "title": "Fix Laptop Display Screen",
  "category": "Hardware",
  "description": "Screen flickers when moving the hinge."
}
```
- **201 Created Response**:
```json
{
  "id": 1,
  "title": "Fix Laptop Display Screen",
  "description": "Screen flickers when moving the hinge.",
  "category": "Hardware",
  "dateCreated": "2026-08-27T18:45:00.123",
  "createdBy": "Jane Doe",
  "userId": 1
}
```

---

### 2.2 Get All Requests for Current User
- **HTTP Method**: `GET`
- **Endpoint URL**: `http://localhost:8080/api/requests`
- **200 OK Response**:
```json
[
  {
    "id": 1,
    "title": "Fix Laptop Display Screen",
    "description": "Screen flickers when moving the hinge.",
    "category": "Hardware",
    "dateCreated": "2026-08-27T18:45:00.123",
    "createdBy": "Jane Doe",
    "userId": 1
  }
]
```

---

### 2.3 Get Request By ID
- **HTTP Method**: `GET`
- **Endpoint URL**: `http://localhost:8080/api/requests/{id}`
- **200 OK Response** (If caller is owner):
```json
{
  "id": 1,
  "title": "Fix Laptop Display Screen",
  "description": "Screen flickers when moving the hinge.",
  "category": "Hardware",
  "dateCreated": "2026-08-27T18:45:00.123",
  "createdBy": "Jane Doe",
  "userId": 1
}
```
- **403 Forbidden Response** (If caller is NOT the owner):
```json
{
  "timestamp": "2026-08-27T18:45:10",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to view service request #1 because it belongs to another user."
}
```

---

### 2.4 Update Service Request
- **HTTP Method**: `PUT`
- **Endpoint URL**: `http://localhost:8080/api/requests/{id}`
- **Request Body**:
```json
{
  "title": "Fix Laptop 4K Display Screen (Urgent)",
  "category": "Hardware",
  "description": "Display went black completely."
}
```
- **200 OK Response** (If owner):
```json
{
  "id": 1,
  "title": "Fix Laptop 4K Display Screen (Urgent)",
  "description": "Display went black completely.",
  "category": "Hardware",
  "dateCreated": "2026-08-27T18:45:00.123",
  "createdBy": "Jane Doe",
  "userId": 1
}
```
- **403 Forbidden Response** (If not owner):
```json
{
  "timestamp": "2026-08-27T18:45:15",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to update service request #1 because it belongs to another user."
}
```

---

### 2.5 Delete Service Request
- **HTTP Method**: `DELETE`
- **Endpoint URL**: `http://localhost:8080/api/requests/{id}`
- **200 OK Response** (If owner):
```json
{
  "message": "Service request #1 deleted successfully."
}
```
- **403 Forbidden Response** (If not owner):
```json
{
  "timestamp": "2026-08-27T18:45:20",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to delete service request #1 because it belongs to another user."
}
```
