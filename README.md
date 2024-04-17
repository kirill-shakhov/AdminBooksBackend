# Project Documentation

## Overview

This project focuses on backend functionalities with an emphasis on JWT authentication and securing private requests. It
includes user registration with image upload, user authentication, book upload with titles and images, adding
descriptions and comments to books, and more.

## Main Features and API Endpoints

## Auth

### User Registration with Image Upload

- **Endpoint:** `/register`
- **Method:** POST
- **Parameters:** First Name, Last Name, Username, Password, Image (optional)
- **Functionality:** Creates a new user with the option to upload a profile image.

### User Authentication

- **Endpoint:** `/login`
- **Method:** POST
- **Parameters:** Username, Password
- **Functionality:** Authenticates the user and issues a JWT.

## Book

### Fetching List of added Genres (JWT required)

- **Endpoint:** `/books/genres`
- **Method:** GET
- **Functionality:** Retrieves a list of added genres.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Adding a new genre (JWT required)

- **Endpoint:** `/books/genres/add`
- **Method:** POST
- **Parameters:** Name
- **Functionality:** adds a new genre.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching a genre by id (JWT required)

- **Endpoint:** `/books/genres/{genreId}`
- **Method:** GET
- **Parameters:** Genre ID
- **Functionality:** fetching a genre.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching List of added Authors (JWT required)

- **Endpoint:** `/books/authors`
- **Method:** GET
- **Functionality:** Retrieves a list of added authors.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Adding a new author (JWT required)

- **Endpoint:** `/books/authors/add`
- **Method:** POST
- **Parameters:** Name
- **Functionality:** adds a new author.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching Author Information

- **Endpoint:** `/books/authors/{authorId}`
- **Method:** GET
- **Functionality:** fetching an author.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Book Upload (JWT required)

- **Endpoint:** `/books/upload`
- **Method:** POST
- **Parameters:** Title, GenreName, AuthorName, Book, Image
- **Functionality:** Uploads a book.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching List of added books (JWT required)

- **Endpoint:** `/books`
- **Method:** GET
- **Functionality:** fetching user's books.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching Book Information (JWT required)

- **Endpoint:** `/books/{bookId}`
- **Method:** GET
- **Parameters:** Book ID
- **Functionality:** Retrieves information about a book.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Fetching Book Information (JWT required)

- **Endpoint:** `/books/{bookId}`
- **Method:** GET
- **Parameters:** Book ID
- **Functionality:** Retrieves information about a book.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Update Book Information (JWT Required)

- **Endpoint:** `/books/{bookId}`
- **Parameters:** Title, GenreName, AuthorName, Book, Image
- **Method:** PATCH
- **Functionality:** Updates book details including title, image, book file, genre, and author. If new image or book
  files are provided, old files are deleted.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Delete a Book (JWT Required)

- **Endpoint:** `/books/{bookId}`
- **Parameters:** Book ID
- **Method:** DELETE
- **Functionality:** Deletes a book by id.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

## Additional Technical Details

- **Security:** Utilizes JWT or a similar mechanism for session management and API access control.
- **Data Validation:** Incoming data is validated on the server to prevent incorrect input and attacks.
- **File Handling:** Uses appropriate libraries for handling uploaded files (e.g., `multer` for Node.js).
- **Data Storage:** User and book information is stored in MongoDB.

## Profile

### Fetching user data (JWT required)

- **Endpoint:** `/profile`
- **Method:** GET
- **Functionality:** fetching user data.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

### Update profile  (JWT required)

- **Endpoint:** `/profile/update`
- **Method:** PATCH
- **Parameters:** FirstName (optional), LastName(optional) (optional), Username (optional), Image (optional)
- **Functionality:** updating user data.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

## Project Structure

Below is the directory layout of the project, which organizes the application's various parts into a clean and manageable structure:

```plaintext
AdminBooksBackend/
│
├── src/                      # Source files for the application
│   ├── api/                  # API endpoints
│   │   ├── controllers/      # Controllers to handle requests
│   │   └── routes/           # Route definitions
│   │
│   ├── app.js                # Entry point of the application
│   ├── config/               # Configuration files
│   │
│   ├── dtos/                 # Data transfer objects
│   ├── exceptions/           # Custom error handling
│   ├── middleware/           # Middleware functions
│   ├── migrations/           # Database migration scripts
│   ├── models/               # Database models
│   └── services/             # Business logic and services
│
├── .env                      # Environment variable files
├── package.json              # Project description and dependencies
└── README.md                 # Project documentation
```

## Technologies and Tools

### Platform and Programming Language

- **Node.js**: Serves as the server-side platform for running JavaScript on the server.
- **Express**: A web application framework for Node.js, version 4.18.2, simplifying the setup of routes and management
  of HTTP requests.

### Database

- **MongoDB**: A NoSQL database used for storing all user, book, and comments data.
- **Mongoose**: Version 8.0.3, an ODM (Object Data Modeling) library for MongoDB and Node.js that manages relationships
  between data and provides schema validation.

### File Handling and Storage

- **Multer**: Version 1.4.5-lts.1, a middleware for handling `multipart/form-data`, which is used for uploading image
  and PDF files to the server.
- **Amazon S3 (Assumed)**: Utilized for secure and scalable storage of large media files like book images and PDFs, enhancing file management and access.

### Authentication and Security

- **JWT (JSON Web Tokens)**: Utilizes version 9.0.2 for managing sessions and securing API access, ensuring that only
  authenticated users can access certain API endpoints.
- **bcryptjs**: Version 2.4.3, used for hashing and securing user passwords.
- **Cookie-parser**: Version 1.4.6, middleware to help you manage cookies.

### Networking and APIs

- **CORS (Cross-Origin Resource Sharing)**: Version 2.8.5, a package that allows or restricts requested resources on a
  web server depending on where the HTTP request was initiated.

### Utilities

- **Dotenv**: Version 16.3.1, manages environment variables which help configure different aspects of the application
  without hard-coding sensitive information.
- **Nodemailer**: Version 6.9.8, a module for Node.js to send emails easily.
- **uuid**: Version 9.0.1, provides RFC4122 UUIDs for creating unique identifiers necessary for session tokens or
  similar use cases.

### Data Validation

- **Express-Validator**: Version 7.0.1, a library used to validate and sanitize input data to prevent incorrect data
  entry and security threats like SQL Injection.

These technologies and tools collectively form the backbone of the application, enabling robust, secure, and scalable
backend services. Their specific versions ensure compatibility and stability across the different components of the
application.



