# Backend Project Documentation

## Overview

This project focuses on backend functionalities with an emphasis on JWT authentication and securing private requests. It includes user registration with image upload, user authentication, book upload with titles and images, adding descriptions and comments to books, and more.

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

### Book Upload with Title and Image (JWT required)
- **Endpoint:** `/upload`
- **Method:** POST
- **Parameters:** Title, Book File, Book Image (optional), Author, Genre, 
- **Functionality:** Uploads a book to the server.

### Fetching Book Information
- **Endpoint:** `/books/{bookId}`
- **Method:** GET
- **Parameters:** Book ID
- **Functionality:** Retrieves information about a book.

### Fetching List of Books
- **Endpoint:** `/books`
- **Method:** GET
- **Functionality:** Retrieves a list of all books with basic information.

### Fetching List of added Genres
- **Endpoint:** `/books/genres`
- **Method:** GET
- **Functionality:** Retrieves a list of added genres.

### Adding a new genre to the server (JWT required)
- **Endpoint:** `/books/genres/add`
- **Method:** POST
- **Parameters:** Name,
- **Functionality:** adds a new genre to the server.

### Adding a new author to the server (JWT required)
- **Endpoint:** `/books/authors/add`
- **Method:** POST
- **Parameters:** Name,
- **Functionality:** adds a new author to the server.

## Additional Technical Details

- **Security:** Utilizes JWT or a similar mechanism for session management and API access control.
- **Data Validation:** Incoming data is validated on the server to prevent incorrect input and attacks.
- **File Handling:** Uses appropriate libraries for handling uploaded files (e.g., `multer` for Node.js).
- **Data Storage:** User and book information is stored in MongoDB.

## Data Models

### User
- **Description:** Represents system users.
- **Fields:** ID, First Name, Last Name, Username, Password (hashed), Image (optional URL).

### Book
- **Description:** Represents information about a book.
- **Fields:** ID, Title, Description (optional), Image (optional URL), PDF File URL, Uploader's User ID.

### Book Comment
- **Description:** Contains user comments on a specific book.
- **Fields:** ID, Book ID, User ID, Comment Text, Creation Date.

## Suggested Folder Structure for a Monolithic Node.js Project


