# Authenticated Service Request Management System

A full-stack web application built with **ReactJS** and **Spring Boot**, featuring secure stateless authentication and access control using **Spring Security** and **JSON Web Tokens (JWT)**.

This application provides a secure **Service Request Module** where authenticated users can create, view, update, and delete their own service requests. Access control is strictly enforced on the Spring Boot backend—ensuring users can never view, edit, or delete requests belonging to another user.

---

## Technology Stack

- **Frontend**: React 18, Vite, Axios, Lucide Icons, Vanilla CSS (Design Tokens & Glassmorphism)
- **Backend**: Spring Boot 4.x / Java 19, Spring Data JPA, Spring Validation
- **Security**: Spring Security 6/7, Stateless JWT (`io.jsonwebtoken:jjwt:0.12.6`), HMAC-SHA256
- **Database**: Relational Database via JPA (Default: MySQL; In-memory H2 support included)

---

## Key Features & Security Architecture

### 1. Authentication & Session Management
- **Registration (`POST /api/auth/register`)**: Validates input, hashes password with salted SHA-256, creates user record, and issues a signed JWT token.
- **Login (`POST /api/auth/login`)**: Authenticates credentials and returns user details with a 24-hour signed JWT token.
- **Stateless Authorization**: All protected endpoints require `Authorization: Bearer <jwt-token>`.
- **Backend Principal Extraction**: The backend identifies the authenticated user directly from the decoded JWT claims (`SecurityContextHolder`), preventing spoofing and never relying on client-supplied user IDs for ownership.

### 2. Service Request Management
- **Create Request (`POST /api/requests`)**: Allows authenticated users to submit service requests with Title, Category, and Description.
- **View My Requests (`GET /api/requests`)**: Returns only the service requests created by the authenticated user.
- **View Request by ID (`GET /api/requests/{id}`)**: Returns request details if owned by the user; returns `403 Forbidden` if owned by another user.
- **Update Request (`PUT /api/requests/{id}`)**: Updates request title, category, and description if owned by the user; returns `403 Forbidden` if attempted on another user's request.
- **Delete Request (`DELETE /api/requests/{id}`)**: Permanently removes request if owned by the user; returns `403 Forbidden` if attempted on another user's request.
- **Logout**: Clears JWT token and user session from client storage and redirects to login.

```
ReactJS Client  ──(Bearer JWT)──►  JwtAuthenticationFilter  ──►  Spring Security Context
                                                                           │
MySQL / H2 DB  ◄──  ServiceRequestRepository  ◄──  ServiceRequestService ──┘
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and receive JWT | No |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT | No |
| `GET` | `/api/home` | Backend health check / greeting | No |
| `GET` | `/api/users` | List registered user directory | No |

### Protected Service Request Endpoints (`Authorization: Bearer <token>`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Create a new service request | `201 Created` |
| `GET` | `/api/requests` | Get all service requests of logged-in user | `200 OK` |
| `GET` | `/api/requests/{id}` | Get request details by ID (owner only) | `200 OK` / `403 Forbidden` |
| `PUT` | `/api/requests/{id}` | Update service request by ID (owner only) | `200 OK` / `403 Forbidden` |
| `DELETE` | `/api/requests/{id}` | Delete service request by ID (owner only) | `200 OK` / `403 Forbidden` |

---

## Installation & Running Instructions

### Prerequisites
- **Java Development Kit (JDK)**: Java 19+ installed (`java -version`)
- **Node.js**: Node 18+ and npm (`node -v`, `npm -v`)
- **MySQL Database** (or in-memory H2):
  - Ensure MySQL is running on port `3306` with database `backend_db`.
  - To create the database in MySQL:
    ```sql
    CREATE DATABASE IF NOT EXISTS backend_db;
    ```

---

### Step 1: Running the Backend (Spring Boot)

1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Run the Spring Boot application using Maven:
   ```powershell
   # On Windows (PowerShell or Command Prompt):
   .\mvnw.cmd spring-boot:run

   # On Linux/macOS:
   ./mvnw spring-boot:run
   ```

3. The backend server will start on **`http://localhost:8080`**.

4. *(Optional)* Run backend automated tests:
   ```powershell
   .\mvnw.cmd clean test
   ```

---

### Step 2: Running the Frontend (React + Vite)

1. Open a second terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Verification & Multi-User Testing Guide

To verify user data isolation as required by the specification:

### Scenario: Testing with Two User Accounts

#### 1. User A Flow:
1. Navigate to `http://localhost:5173` and click **Register**.
2. Register account:
   - **Name**: `Alice Walker`
   - **Email**: `alice@example.com`
   - **Password**: `Password123!`
3. Log in as `alice@example.com`.
4. Click **My Service Requests** in the top navigation.
5. Click **New Service Request** and create:
   - **Title**: `Fix Laptop Display Screen`
   - **Category**: `Hardware`
   - **Description**: `The laptop monitor is flickering when moving the hinge.`
6. Note the generated ID (e.g. `#SR-1`).
7. Edit the request title to `Fix Laptop 4K Display Screen` -> Verify changes persist.

#### 2. User B Flow (Testing Data Isolation):
1. In the top navigation, click **Logout**.
2. Register a second account:
   - **Name**: `Bob Smith`
   - **Email**: `bob@example.com`
   - **Password**: `Password123!`
3. Log in as `bob@example.com`.
4. Navigate to **My Service Requests**.
5. **Verify**: Alice's request (`#SR-1`) is **NOT** visible in Bob's list.
6. Create Bob's own request:
   - **Title**: `VPN Access Request`
   - **Category**: `IT Support`
   - **Description**: `Need remote VPN setup for internal servers.`
7. **Verify**: Bob only sees `#SR-2`.

#### 3. Direct Backend Security Enforcement Test (Manual API Verification):
Try accessing Alice's request `#1` using Bob's JWT token via cURL or Postman:

```bash
# Attempt to view Alice's request as Bob:
curl -X GET http://localhost:8080/api/requests/1 \
  -H "Authorization: Bearer <BOB_JWT_TOKEN>"

# Attempt to update Alice's request as Bob:
curl -X PUT http://localhost:8080/api/requests/1 \
  -H "Authorization: Bearer <BOB_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Malicious Update","description":"Hacked","category":"Security"}'

# Attempt to delete Alice's request as Bob:
curl -X DELETE http://localhost:8080/api/requests/1 \
  -H "Authorization: Bearer <BOB_JWT_TOKEN>"
```

**Result**: In all cases, the Spring Boot backend rejects the request and returns **`403 Forbidden`**:
```json
{
  "timestamp": "2026-08-27T18:45:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to view service request #1 because it belongs to another user."
}
```

---

## Project Structure

```
Acctivityy1/
├── Backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/example/backend/
│       │   ├── config/
│       │   │   ├── CorsConfig.java
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── HomeController.java
│       │   │   ├── ServiceRequestController.java
│       │   │   └── UserController.java
│       │   ├── dto/
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── ServiceRequestRequestDto.java
│       │   │   └── ServiceRequestResponseDto.java
│       │   ├── exception/
│       │   │   ├── AccessDeniedCustomException.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── ResourceNotFoundException.java
│       │   ├── model/
│       │   │   ├── ServiceRequest.java
│       │   │   └── User.java
│       │   ├── repository/
│       │   │   ├── ServiceRequestRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/
│       │   │   ├── CustomUserDetailsService.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── JwtUtil.java
│       │   ├── service/
│       │   │   ├── ServiceRequestService.java
│       │   │   └── UserService.java
│       │   └── util/
│       │       └── PasswordUtil.java
│       └── test/java/com/example/backend/
│           └── ServiceRequestSecurityTest.java
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   └── Navbar.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── ServiceRequests.jsx
│       └── services/
│           └── api.js
└── README.md
```
