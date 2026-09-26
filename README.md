# URL Shortener
## 1. Overview
A URL shortener built with Node.js, Express, Sequelize, and MySQL.

## 2. Features
- User registration and JWT-based authentication
- Create and manage shortened URLs
- Custom aliases
- URL expiration
- Click tracking
- QR generation
- REST API

## 3. Installation
1. Clone the repository
2. Create an empty database using 
`CREATE DATABASE IF NOT EXISTS <your_db_name>`
4. Edit the `.env` file.
5. Install the required packages.
5. Run `npx sequelize-cli db:migrate`.
6. Run the application using `npm run dev`.
