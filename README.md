# CivicConnect
CivicConnect is a web application designed to bridge the gap between citizens and local authorities. It provides a transparent and efficient platform for reporting, tracking, and resolving civic issues like potholes, garbage buildup, and streetlight failures.
This project was built for an Agentic AI hackathon to empower communities and improve neighborhood accountability.

## Problem
Citizens often struggle to report local issues effectively. Complaints can get lost in bureaucracy, and there is frequently no clear system for citizens to track the status of their reports or see what issues are being addressed in their area.

## Features
* **User Authentication:** Secure login and signup system for citizens (`auth.js`).
* **Admin Access:** Separate login portal for administrators/local authorities to manage issues (`auth.js`).
* **Detailed Issue Reporting:** A comprehensive reporting form that allows users to select an issue type, provide a detailed description, and upload photos (`report.js`).
* **Google Maps Integration:**
    * Users can pinpoint the exact location of an issue using an interactive Google Map (`map.js`, `report.js`).
    * Support for "Use My Current Location" (Geolocation).
    * Location search powered by the Google Places API.
* **Personal User Dashboard:** Once logged in, users can view a personal dashboard listing all the issues they have reported, along with the current status of each (Pending, In Progress, Resolved) (`dashboard.js`).
* **Admin Dashboard:** (Inferred) An administrative panel to view all incoming complaints, update their status, and add comments.
* **Public Transparency Map:** A community map that displays the location and status of reported issues, providing transparency to all citizens (`map.js`).

## Technology Stack
* **Frontend:** HTML, CSS, JavaScript (ES6+)
* **Backend (Database):** Google Sheets (as inferred from `sheetsService` references in the code) acting as a lightweight database for user and report data.
* **APIs:**
    * Google Maps JavaScript API
    * Google Maps Places API
    * Google Maps Geolocation API

## File Structure
This prototype's core client-side logic is managed by the following files:

* `auth.js`: Handles all user authentication, including citizen login/signup and the separate admin login modal. Manages user sessions in `localStorage`.
* `report.js`: A `ReportManager` class that controls the issue reporting modal, form validation, photo uploads (with preview), and location selection via the map.
* `map.js`: Initializes the main community map and the map used within the reporting modal. Handles marker placement and map styling.
* `dashboard.js`: Manages the user dashboard. It fetches and displays the user's reported issues, filtering them by status (All, Pending, In Progress, Resolved).

## Setup and Installation
To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```
2.  **Configure Google Maps API:**
    * You will need a Google Cloud Platform project with the Maps JavaScript API and Places API enabled.
    * Generate an API key.
    * Add your API key to the `<script>` tag in your `index.html` file where Google Maps is loaded:
    ```html
    <script src="[https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap](https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap)" async defer></script>
    ```
3.  **Configure Google Sheets Backend:**
    * This project is configured to work with a Google Sheets backend via an Apps Script (implied by `sheetsService`).
    * You will need to deploy your own Google Apps Script web app that can handle `getUser`, `saveUser`, and `saveReport` functions.
    * Update the `sheetsService` (in its own file, not provided here) with your deployed Apps Script URL.
4.  **Run the application:**
    * Since this is a simple frontend project, you can open the `index.html` file directly in your web browser.
    * For best results (especially with API calls), serve the files using a local web server:
    ```bash
    # If you have Python 3
    python -m http.server
    # Or if you have Node.js
    npx live-server
    ```
    * Access the project at `http://localhost:8000`.

## How to Use

### As a Citizen:
1.  **Sign Up:** Create a new account using your email and password.
2.  **Log In:** Access your account.
3.  **Report an Issue:**
    * Click the "Report Issue" button.
    * Fill in the form: select the issue type and write a description.
    * Select the location by clicking on the map, searching for an address, or using the "Find My Location" button.
    * Upload one or more photos of the issue.
    * Click "Submit".
4.  **Track Your Issues:**
    * Navigate to the "Dashboard" section.
    * View all your submitted reports and their current status.

### As an Administrator:
1.  Click the "Admin Login" button.
2.  Enter the demo credentials:
    * **Username:** `admin`
    * **Password:** `admin123`
3.  Access the admin dashboard (once loaded) to view and manage all user-submitted reports.
