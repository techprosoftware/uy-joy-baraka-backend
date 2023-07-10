# Uy Joy Baraka Backend

# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 18.16.0
- Install [PostgreSQL](https://www.postgresql.org/download/) version 14.2

# Getting started
- Clone the repository
```
git clone  https://github.com/techprosoftware/uy-joy-baraka-backend.git
```
- Install dependencies
- Create an .env file according to example.env
```
cd uy-joy-baraka-backend
npm install
```
- Run the project
```
npm run dev
```
Navigate to `http://localhost:4000`

- API Document endpoints

  swagger Spec Endpoint : http://localhost:4000/api-docs

# File Structure
```
|--bin
|   |--www.js
|--controllers
|   |--auth
|   |   |--auth-controller.js
|   |--admin
|   |   |--admin-controller.js
|   |--user
|   |   |--user-controller.js
|   |--announcement
|   |   |--announcement-controller.js
|   |--chat
|   |   |--chat-controller.js
|   |--home
|   |   |--home-controller.js
|   |--socket
|   |   |--socket-controller.js
|--docs
|   |--swagger.json
|--middlewares
|  |--admin-middleware.js
|  |--dont-enter-middleware.js
|  |--user-middleware.js
|  |--upload-multiple-middleware.js
|  |--socket-middleware.js
|--models
|   |--models.js
|--modules
|   |--bcrypt.js
|   |--compression.js
|   |--generate-code.js
|   |--jwt.js
|   |--postgres.js
|   |--rate-limit.js
|   |--sms.js
|--public
|   |--css
|   |--js
|   |--scripts
|   |--images
|   |   |--uploads
|   |   |--users
|--routes
|   |--admin-route.js
|   |--announcement-route.js
|   |--chat-route.js
|   |--home-route.js
|   |--user-route.js
|--validations
|   |--admin-login.js
|   |--announcement-update-validation.js
|   |--announcement-validation.js
|   |--code-validation.js
|   |--edit-full-name-validation.js
|   |--login-validation.js
|   |--message-validation.js
|   |--pagination-validation.js
|   |--phone-validation.js
|   |--receiver-id-validation.js
|   |--search-validation.js
|   |--signup-validation.js
|   |--slug-validation.js
|   |--uuid-validation.js
|--views
|   |--404.ejs
|   |--admin
|   |   |--announcement.ejs
|   |   |--index.ejs
|   |   |--login.ejs
|   |   |--pending.ejs
|   |   |--users.ejs
|   |   |--components
|   |   |   |--header.ejs
|   |   |   |--footer.ejs
|   |   |   |--sidebar.ejs
|   |   |   |--navbar.ejs
|.env
|.gitignore.js
|app.js
|config.js
|package-lock.json
|package.json
|README.md
```


