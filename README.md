# EcoBand+
The Wearable that Measures your Carbon Karma

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment Guide

### 1. Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or sign in
2. Create a new project
3. Build a new cluster (free tier is sufficient)
4. Set up database access:
   - Create a database user with password
   - Add your IP to the IP Access List (or allow access from anywhere for development)
5. Get your connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace <password> with your database user's password

### 2. Deploy to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel](https://vercel.com) and:
   - Sign up or log in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository you want to deploy

3. Configure project:
   - Vercel will automatically detect it as a Node.js project
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: `public`
   - Install Command: `npm install`

4. Add Environment Variables:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your secure JWT secret key
     - `PORT`: 3000

5. Deploy:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once complete, you'll get a deployment URL

### 3. Verify Deployment

1. Visit your deployment URL
2. Test the application:
   - Try signing up for a new account
   - Test the login functionality
   - Verify that metrics are being saved and retrieved

### 4. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow Vercel's instructions to configure your domain's DNS settings

## Troubleshooting

- If the application fails to connect to MongoDB, verify your MONGODB_URI in Vercel's environment variables
- Check Vercel's deployment logs for any build or runtime errors
- Ensure all environment variables are correctly set in Vercel's project settings
- Verify that your MongoDB Atlas cluster is running and accessible
