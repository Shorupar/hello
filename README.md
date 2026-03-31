This is a full-stack web application that includes authentication and two types of user dashboards: Seller Dashboard and Buyer Dashboard.
Users can sign up, log in, and access dashboards based on their role. Sellers can manage products, and buyers can view products and add favourites.

The project consists of:

1.Backend (Node.js, Express, MySQL)
2.Frontend (React, TypeScript)
3.Database (MySQL)

How to Run the Website

1. Setup Database
i.Open MySQL or phpMyAdmin
ii.Create a new database
iii.Import the SQL file: hello.sql

2. Run Backend
i.Open terminal and go to backend folder:
-cd backend
-npm install
-node app.js
ii.Backend will run on:
http://localhost:3000

3. Run Frontend
i.Open another terminal:
-cd frontend
-npm install
-npm start

Application Flows

Flow 1: Sign Up → Login (Seller) → Seller Dashboard
1.Open the frontend in browser.
2.Go to Sign Up page.
3.Register with fullName, email, and password.
4.After registration, go to Login page.
5.Login with registered credentials.
6.User is redirected to Seller Dashboard.
7.Seller Dashboard will display:
-Dashboard cards (Products Count)
-Products Tab (Manage Products)

Flow 2: Sign Up → Login (Buyer) → Buyer Dashboard
1.Open the frontend in browser.
2.Go to Sign Up page.
3.Register with fullName, email, and password.
4.After registration, go to Login page.
5.Login with registered credentials.
6.User is redirected to Buyer Dashboard.
7.Buyer Dashboard will display:
-Products Tab
-Favourite Tab

Technologies Used

1.Frontend
-React
-TypeScript
-Axios
-CSS

2.Backend
-Node.js
-Express.js
-MySQL
-JWT Authentication
-Multer (File Upload)



This project demonstrates:
-Full Stack Web Development
-User Authentication (JWT)
-Role-based Dashboard (Seller & Buyer)
-Product Management
-Favourite System
-File Upload Handling
-REST API Development
-MySQL Database Integration
