### Application Overview

**Name**: PSN API Server

The app uses TypeScript, ESLint, Express, MongoDB, [PlayStation Network (PSN) API](https://andshrew.github.io/PlayStation-Trophies/#/APIv2), and the other specified technologies. It creates the backend for a **Gaming Profile Management App** that allows users to connect their PlayStation accounts, view their gaming stats, and manage their gaming profiles.

By implementing features such as JWT authentication, password hashing with bcrypt, and using middleware for security, the app is built with a focus on safety and user experience. The integration with the PSN API enriches user data, making it a valuable tool for gamers. The architecture is extensible, allowing for future enhancements and features like game recommendations, community forums, or achievement tracking.

### Features

1. **User Authentication**:
   - Users can sign up and log in using email/password or OAuth (linked to their PlayStation account).

2. **Link PSN Account**:
   - Users can connect their PlayStation Network accounts to import their gaming stats.

3. **View Gaming Stats**:
   - Display information such as trophies, hours played, and recent activity.

4. **[TODO] Profile Management**:
   - Users can update their gaming profile, including username, avatar, and bio.

5. **[TODO] Friend Connections**:
   - Users can search for friends on PSN and send friend requests.

6. **Secure API**:
   - Use JWT for protecting routes and securing user data.

### Tech Stack

- **Backend**:
  - **TypeScript**: For type safety.
  - **Express**: Web framework for the API.
  - **MongoDB**: NoSQL database for data storage.
  - **bcryptjs**: For password hashing.
  - **jsonwebtoken**: For generating and verifying JWT tokens.
  - **body-parser**: Middleware for parsing incoming request bodies.
  - **cookie-parser**: Middleware for parsing cookies.
  - **cors**: Middleware for enabling Cross-Origin Resource Sharing.
  - **morgan**: HTTP request logger middleware for Node.js.
  - **helmet**: Middleware for securing Express apps by setting various HTTP headers.
  - **psn-api**: Integration for fetching user gaming data.

- **Development Tools**:
  - **ESLint**: For maintaining code quality.


### Application Architecture

1. **Frontend (not covered here)**:
   - React (or another framework) could be used for the user interface, making API calls to the backend.

2. **Backend**:
   - **Express Server**: Handles routing and API requests.
   - **MongoDB**: Stores user profiles, linked PSN accounts, and other necessary data.
   - **PSN API Integration**: Connects to the PSN API to fetch user gaming data.

### Install and run the app with the following commands

- Make sure you have set up the **.env** file. See the **.env_example** file to check the required variables.

```bash
npm install

npm run dev
```

### Backend Setup Description (Examples)
#### - Note: You can check the current setup in the repository

1. **Configure TypeScript**:
   - Create a `tsconfig.json` to define TypeScript settings.

2. **Setup ESLint**:
   - Create an `.eslintrc.js` configuration file to set up linting rules.

3. **Create the Express Server**:
   ```typescript
   import express from 'express';
   import mongoose from 'mongoose';
   import dotenv from 'dotenv';
   import bodyParser from 'body-parser';
   import cookieParser from 'cookie-parser';
   import cors from 'cors';
   import morgan from 'morgan';
   import helmet from 'helmet';

   dotenv.config();

   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(cors());
   app.use(helmet());
   app.use(morgan('dev'));
   app.use(bodyParser.json());
   app.use(cookieParser());

   mongoose.connect(process.env.MONGODB_URI!, { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error(err));

   app.listen(PORT, () => {
       console.log(`Server running on http://localhost:${PORT}`);
   });
   ```

4. **Create User Model**:
   ```typescript
   import { Schema, model } from 'mongoose';

   const userSchema = new Schema({
       username: { type: String, required: true, unique: true },
       email: { type: String, required: true, unique: true },
       password: { type: String, required: true },
       psnId: { type: String },
       gamingStats: { type: Object }
   });

   const User = model('User', userSchema);
   export default User;
   ```

5. **User Registration and Authentication**:
   ```typescript
   import bcrypt from 'bcryptjs';
   import jwt from 'jsonwebtoken';
   import User from './models/User';

   // Registration Endpoint
   app.post('/api/register', async (req, res) => {
       const { username, email, password } = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({ username, email, password: hashedPassword });
       await user.save();
       res.status(201).send({ message: 'User created' });
   });

   // Login Endpoint
   app.post('/api/login', async (req, res) => {
       const { email, password } = req.body;
       const user = await User.findOne({ email });
       if (!user || !(await bcrypt.compare(password, user.password))) {
           return res.status(401).send({ message: 'Invalid credentials' });
       }
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
       res.cookie('token', token, { httpOnly: true });
       res.send({ message: 'Login successful' });
   });
   ```

6. **Link PSN Account**:
   ```typescript
   app.post('/api/link-psn', async (req, res) => {
       const { psnId } = req.body;
       const userId = req.user.id; // Assuming user ID is available from JWT middleware
       await User.findByIdAndUpdate(userId, { psnId });
       // Fetch and save gaming stats from PSN API
       res.send({ message: 'PSN account linked' });
   });
   ```

7. **Middleware for JWT Verification**:
   ```typescript
   const authenticateJWT = (req, res, next) => {
       const token = req.cookies.token;
       if (token) {
           jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
               if (err) {
                   return res.sendStatus(403);
               }
               req.user = user;
               next();
           });
       } else {
           res.sendStatus(401);
       }
   };

   // Protecting routes
   app.use('/api/protected', authenticateJWT);
   ```


### Testing and Deployment
- Use tools like Postman to test your API endpoints.
