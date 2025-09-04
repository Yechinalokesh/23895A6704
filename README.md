React URL Shortener App

Font Recommendation: Times New Roman

Overview:
This is a React-based URL Shortener Web Application built using Material UI. It allows users to shorten multiple URLs concurrently, track statistics, and handle redirection—all on the client side using localStorage for persistence.

Features:

URL Shortener Page

Shorten up to 5 URLs at once.

Optional validity period (default: 30 minutes).

Optional custom shortcode (alphanumeric, must be unique).

Client-side validation for URLs, shortcodes, and validity.

Displays shortened URLs with expiry date.

Statistics Page

Displays all shortened URLs.

Shows creation and expiry date, total clicks.

Detailed click data including timestamp, source, and simulated geo-location.

Redirection

Accessing a shortened URL redirects to the original URL.

Clicks are recorded for statistics.

Logging

Custom logging middleware stores logs in localStorage.

Error Handling

Graceful error messages for invalid input, shortcode collision, and redirection errors.

Technology Stack:

Frontend: React

Styling: Material UI

Routing: React Router

Persistence: localStorage

Logging: Custom logging middleware

Installation & Running:

Clone the repository from GitHub: https://github.com/Yechinalokesh/23895A6704

Navigate to the project folder.

Install dependencies by running npm install.

Start the application by running npm start.

Open http://localhost:3000
 in your browser.

Project Structure:

src/components/UrlShortenerPage.jsx

src/components/StatisticsPage.jsx

src/components/LoggingMiddleware.js

src/services/UrlService.js

App.jsx

index.js

Data Model:
Each shortened URL is stored as an object containing:

originalUrl

shortcode

validity (in minutes)

createdAt and expiryAt timestamps

clicks (array of objects with timestamp, source, and geo-location)

Assumptions:

Users are pre-authorized; no authentication is needed.

Custom shortcodes must be unique; system generates unique shortcodes automatically.

Click source and geo-location are simulated.


.
