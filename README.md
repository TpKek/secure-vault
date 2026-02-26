# Secure Vault 🔐

A secure authentication application built with Express.js, PostgreSQL, and EJS, demonstrating full-stack development skills with user registration, login functionality, and secure data handling.

## Features

- User Registration with PostgreSQL database
- User Login with secure authentication
- Secure secrets management
- Parameterized SQL queries (SQL injection protection)
- EJS templating for dynamic views

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Templating**: EJS
- **Authentication**: Session-based (extensible)
- **Frontend**: HTML, CSS

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TpKek/secure-vault.git

# Navigate to the project directory
cd secure-vault

# Install dependencies
npm install

# Set up your database
# Create a PostgreSQL database named 'secrets'
# Update .env file with your database credentials

# Start the server
npm start
```

The application will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=secrets
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=3000
```

## Project Structure

```
secure-vault/
├── public/
│   └── css/
│       └── styles.css
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── secrets.ejs
│   └── submit.ejs
├── .env
├── app.js
├── schema.sql
└── package.json
```

## Database Schema

Run the SQL commands in `schema.sql` to set up your database tables.

## License

ISC

## Author

Bertin Dreyer
