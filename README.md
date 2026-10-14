# Hotel Reservation System — SE Project

**Group:** 26-MTR-SE2030-06 | **Institution:** SLIIT | **Module:** SE2030

## Tech Stack
- **Backend:** Spring Boot 4.x, Java 17, Maven, Spring Security (JWT), Spring Data JPA
- **Frontend:** React 18, Vite, Tailwind CSS, Axios
- **Database:** Microsoft SQL Server

---

## Project Structure
```
SE project/
├── backend/           ← Spring Boot REST API (port 8080)
│   └── src/main/java/com/sliit/hotel/backend/
│       ├── controller/    ← REST endpoints
│       ├── service/       ← Business logic
│       ├── repository/    ← Spring Data JPA
│       ├── entity/        ← JPA Entities (tables)
│       ├── dto/           ← Request/Response DTOs
│       ├── security/      ← JWT filter & UserDetailsService
│       ├── config/        ← SecurityConfig & CorsConfig
│       └── exception/     ← Global error handler
├── frontend/          ← React + Vite (port 5173)
│   └── src/
│       ├── pages/         ← All page components
│       ├── components/    ← Reusable UI components
│       ├── services/      ← Axios API client (api.js)
│       └── context/       ← AuthContext (global auth state)
└── resources for antigravity/  ← Reference documents
```

---

## Prerequisites
- Java 17+
- Maven (or use `./mvnw`)
- Node.js 18+ & npm
- Microsoft SQL Server (local instance)

---

## Setup & Run

### 1. Database Setup
Create a database named `hotel_db` in your SQL Server:
```sql
CREATE DATABASE hotel_db;
```

### 2. Configure Backend Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hotel_db;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD_HERE
```

Before starting the backend, set a unique JWT secret (at least 32 characters) and, if the frontend is not running on the default Vite address, set its allowed origin:
```powershell
$env:JWT_SECRET="replace-with-a-long-random-secret-value"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
```
Do not commit real secrets to `application.properties`.

### 3. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend starts at http://localhost:8080
```
> Spring Boot will automatically create all database tables on first run (`ddl-auto=update`)

### 4. Install & Run the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

---

## API Endpoints (Base: `/api/v1`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new customer |
| POST | `/auth/login` | Public | Login and get JWT token |
| GET | `/venues` | Public | Browse all venues |
| GET | `/packages` | Public | Browse all packages |
| POST | `/reservations` | Customer | Create a reservation |
| GET | `/reservations/my` | Customer | My reservations |
| GET | `/reservations` | Officer/Admin | All reservations |
| PUT | `/reservations/{id}/status` | Officer | Approve/Reject |
| POST | `/quotations` | Officer | Create quotation |
| POST | `/payments` | Finance | Record payment |

---

## Demo Accounts (Auto-seeded by DataInitializer)
| Role | Email | Password |
|------|-------|----------|
| Hotel Admin | `admin@hotel.com` | `Admin@123` |
| Hotel Manager | `manager@hotel.com` | `Manager@123` |
| Reservation Officer | `officer@hotel.com` | `Officer@123` |
| Finance Officer | `finance@hotel.com` | `Finance@123` |
| Customer | `customer@hotel.com` | `Customer@123` |

---

## Academic Context: SE Module vs OOP Module
- **Last Semester (OOP Module):** Focused on object-oriented programming fundamentals using desktop-based JavaFX and raw JDBC (`DriverManager`, `PreparedStatement`) queries.
- **This Semester (Software Engineering - SE Module):** Emphasizes modern Software Development Life Cycle (SDLC), Agile/Scrum teamwork, and clean **3-Tier Layered Web Architecture**:
  - **Presentation Layer:** React (Vite, Tailwind CSS) — responsive, component-driven web UI.
  - **Business & Application Layer:** Spring Boot (Java 17, Spring Security JWT, REST APIs) — pure separation of concerns (Controller $\rightarrow$ Service $\rightarrow$ Repository).
  - **Persistence Layer:** Microsoft SQL Server (SSMS) with Spring Data JPA / Hibernate — eliminates hundreds of lines of boilerplate raw JDBC code, providing clean ORM mapping and connection pooling.
  - **Database Script:** `hotel_db_mssql.sql` is provided in the project root for direct execution in SQL Server Management Studio (SSMS).

---

## Module Assignments (Team of 6)
| Module | Developer | Responsibilities |
|--------|-----------|------------------|
| Reservation Management | Deshan L.A.T. | Booking engine, date conflicts, state machine |
| Venue & Package Management | Chandrasiri E.M.D.D.D. | Spaces & package catalogue, capacity validation |
| Billing & Payment | Samarawickrama S.D. | Payment verification, invoicing, refund engine |
| Quotation Management | Karunasena K.G.T.A. | Itemized pricing, 7-day validity, revisions |
| Promotion Management | Nisanka P.G.U. | Promo code discounts, validity enforcement |
| Feedback & Inquiries | Induwara P.G.T. | Post-event reviews, 14-day revision window, inquiries |
