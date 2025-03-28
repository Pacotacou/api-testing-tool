# API Testing Tool

A lightweight, browser-based API testing tool for developers to easily make HTTP requests and debug API endpoints.

## Features

- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- Query parameter management
- Custom header configuration
- Multiple authentication methods:
  - Basic Authentication
  - Bearer Token
  - API Key (header or query parameter)
- Request body support with multiple content types:
  - JSON
  - Form URL Encoded
  - Plain Text
  - XML
- Response display with status code and timing information
- JSON prettification
- Request history (stored in browser's local storage)
- Clean, responsive UI

## Code Structure

The application consists of three main files:

- `index.html` - The HTML structure of the application
- `index.css` - Styling for the application
- `index.js` - JavaScript functionality for the application

## Getting Started

### Local Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

No server or build process is required as this is a client-side only application.

### Using the Application

1. Enter the URL of the API endpoint you want to test
2. Select the HTTP method to use
3. Add any query parameters, headers, or authentication required
4. Add a request body for POST, PUT, or PATCH requests
5. Click "Send Request" to make the API call
6. View the response details, status code, and timing information

## Authentication Methods

### Basic Auth
Enter username and password for HTTP Basic Authentication.

### Bearer Token
Enter a token to be sent in the Authorization header (e.g., OAuth tokens).

### API Key
Enter a key name and value, and choose whether to send it as a header or a query parameter.

## History

The application saves your most recent 20 requests in the browser's local storage. You can:
- View your request history
- Click on a history item to reload that request
- Clear all history

## Browser Compatibility

This application works with all modern browsers that support:
- ES6 JavaScript
- Fetch API
- Local Storage
- CSS Grid and Flexbox
