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
- **Parameters:** Title, GenreName, AuthorName, Book,  Image 
- **Functionality:** Uploads a book.
- **Authentication:** Access to this endpoint requires a valid JWT to be included in the request header.

###  Fetching List of added books (JWT required)

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
- **Parameters:** Title, GenreName, AuthorName, Book,  Image
- **Method:** PATCH
- **Functionality:** Updates book details including title, image, book file, genre, and author. If new image or book files are provided, old files are deleted.
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


## Suggested Folder Structure for a Monolithic Node.js Project


