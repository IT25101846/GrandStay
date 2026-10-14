# Backend — Running tests

Prerequisites: Java 17 and the included Maven wrapper (mvnw).

Important: set a JWT secret before running the app or CI. The secret must be at least 32 bytes for the JWT HMAC-SHA key.

PowerShell (Windows):

$env:JWT_SECRET = 'your-32+byte-secret'
cd backend
.\mvnw test

Linux / macOS (bash):

export JWT_SECRET='your-32+byte-secret'
cd backend
./mvnw test

Notes:
- Unit/integration tests run against an H2 in-memory database (no external DB required).
- Do NOT commit real secrets to source control.