# E-commerce API

This is the backend of the e-commerce project, built using Node.js, Express, and PostgreSQL. It handles user authentication (including Google OAuth), product management, shopping cart operations, and order processing, along with several security measures.

## Features

- **Authentication:**
  - User registration and login (passwords hashed with bcrypt)
  - Google OAuth with Passport
  - JWT-based authentication and authorization
- **CRUD Operations:**
  - Manage products (create, read, update, delete)
  - Manage shopping cart
  - Order placement and order history
- **Security:**
  - Uses parameterized queries (protects against SQL injection)
  - Implements security middleware: Helmet, csurf, xss-clean, hpp, and rate limiting
- **Sessions:**
  - Configured for Passport (OAuth)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AndreiCtristianBot/ecommerce-api.git
   cd ecommerce-api

2. **Install dependencies:**
   
   ```bash
   npm install

3. **Create a .env file in the root directory with the following variables:**
    PORT=5000
    DB_USER=your_db_user
    DB_HOST=your_db_host
    PGDATABASE=your_database_name
    DB_PASSWORD=your_db_password
    DB_PORT=your_db_port
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
    FRONTEND_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
    NODE_ENV=development


4. **Setup the database:**
    Ensure your PostgreSQL database is running and create the necessary tables (you can use provided SQL scripts).

## Usage

To start the server, run:
   - npm start
The server will be accessible at http://localhost:8000.

## Deploy on Render
1. **Publish this repository on GitHub.**
2. **In Render, create a new Web Service.**
3. **Select the ecommerce-api repository.**
4. **Configure environment variables in the Render dashboard.**
5. **Set the start command (e.g., npm start).**

## Security

This project uses several security measures to protect against common vulnerabilities:

- **Helmet:** Sets secure HTTP headers to protect against well-known web vulnerabilities.
- **csurf and cookie-parser:** Provide CSRF protection by validating tokens on sensitive requests.
- **xss-clean:** Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks.
- **hpp:** Prevents HTTP Parameter Pollution.
- **express-rate-limit:** Limits the number of requests from a single IP to mitigate DoS/DDoS attacks.

These measures, combined with parameterized SQL queries to prevent SQL injection, help ensure a robust security posture. However, security is an ongoing process, and regular audits and updates are recommended.


## License

This project is licensed under the MIT License.