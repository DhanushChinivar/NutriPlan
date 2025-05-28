
# NutriPlan – Meal Planning & Nutrition App

## Overview

**NutriPlan** is a full-stack web application that simplifies personalized meal planning and grocery list creation. This repository contains the complete implementation using Node.js, Express, HTML, CSS, and MongoDB. It also includes detailed setup instructions, design principles, and validation standards to support effective collaboration and high code quality.

## Getting Started

### Prerequisites

Before running this project locally, ensure the following tools and technologies are installed:

- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB (local instance or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nutriplan.git
   cd nutriplan
   ```

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and configure the following:

   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Seed the Database**

   To populate the app with sample meals for testing:

   ```bash
   node seed.js
   ```

   This will insert a set of healthy meals with nutritional information into your MongoDB database, enabling the meal generation feature to work effectively during development and testing.

5. **Start the server**
   ```bash
   node server.js
   ```

6. **Access the application**

   Open your browser and navigate to: `http://localhost:3000`

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js, Express  
- **Database**: MongoDB (Mongoose)  
- **Testing**: Cypress (End-to-End)  
- **Configuration**: dotenv  

## User Input Validation Rules

- **Email**: Must be a valid email format (e.g., `user@example.com`)
- **Password**: Minimum 8 characters, with at least one number and one special character
- **Meal Preferences**: Required selection from available options
- **Grocery List Items**: Must be generated from the meal plan or validated manually

## Testing with Cypress

We use [Cypress](https://www.cypress.io/) for automated end-to-end (E2E) testing.

###  How to Run Cypress Tests

1. Start the server:
   ```bash
   node server.js
   ```

2. Open the Cypress test runner:
   ```bash
   npx cypress open
   ```

3. Select a test from the Cypress UI to run.

###  Test Files Overview

- `account.cy.js` – Tests for login, logout, and user info updates  
- `auth.cy.js` – Tests for user registration and login flow  
- `user.cy.js` – Tests for submitting and validating user preferences  

All test files are located inside the `cypress/e2e/` directory.

## Contributing

To contribute to this project:

1. Fork the repository and clone your fork.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes following best practices and standards.
4. Push the branch to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request describing your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## API Documentation

BASE URL: http://localhost:3000/api

### Auth Routes

1. **User Registration**: POST /auth/register
```json
{
    "password": "abc123",
    "email": "suba@mail.com",
    "firstName": "suba",
    "lastName": "Thinakaran"
}
```
Response:
```json
{
    "message": "Registered successfully"
}
```

2. **User Login**: POST /auth/login
```json
{
    "password": "abc123",
    "email": "suba@mail.com"
}
```
Response:
```json
{
    "message": "Login successful",
    "user": {
        "_id": "681abc50085517721f9c91b4",
        "firstName": "suba",
        "lastName": "Thinakaran",
        "email": "suba@mail.com",
        "password": "$2b$10$eM.we1yqKp/tEfWp7YuCvOH3pg/KMZrB33ZXE8woAWY1FiC0Vkg6O",
        "__v": 0
    }
}
```

3. **Save User Preferences**: POST /user/save
```json
{
    "email": "suba@mail.com",
    "age": 25,
    "height": 168,
    "weight": 58,
    "gender": "female",
    "dietType": "vegetarian",
    "allergies": ["nuts"],
    "mealsPerDay": 3,
    "activityLevel": "low",
    "goal": "weight loss"
}
```
Response:
```json
{
    "message": "User updated successfully"
}
```

4. **Generate meal plan**: POST /meals/generate
```json
{
    "email": "suba@mail.com"
}
```
Response:
```json
{
    "mealPlan": [
        {
            "nutrients": {
                "protein": "24g",
                "fat": "14g",
                "carbs": "70g"
            },
            "name": "Tofu Veggie Bowl",
            "diet": "vegetarian",
            "calories": 820,
            "ingredients": ["tofu", "broccoli", "brown rice", "carrots", "soy sauce"],
            "instructions": "Cook brown rice. Stir-fry tofu and vegetables. Combine and drizzle with soy sauce."
        },
        {
            "nutrients": {
                "protein": "18g",
                "fat": "12g",
                "carbs": "85g"
            },
            "name": "Grilled Vegetable Quinoa Salad",
            "diet": "vegetarian",
            "calories": 740,
            "ingredients": ["quinoa", "zucchini", "bell peppers", "olive oil", "lemon juice"],
            "instructions": "Grill vegetables. Cook quinoa. Toss all with olive oil and lemon juice."
        }
    ],
    "totalCalories": 1612.8
}
```
