# ShaswatApp

A comprehensive shop management and delivery tracking application built with React, TypeScript, Material-UI, Clerk authentication, and Supabase backend.

## Features

- 🏪 **Shop Management** - Add, edit, and manage shops (wholesalers and retailers)
- 📦 **Order Management** - Create and track orders with multiple SKUs
- 🚚 **Delivery Tracking** - Monitor delivery status and routes
- 🔄 **Return Orders** - Handle product returns efficiently
- 📊 **Analytics Dashboard** - View business insights and metrics
- 📋 **Surveys** - Collect feedback and data from shops
- 🔐 **Authentication** - Secure user authentication with Clerk
- 💾 **Cloud Database** - PostgreSQL database with Supabase

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Date Handling**: Day.js with MUI Date Pickers
- **HTTP Client**: Axios

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher) or **yarn**
- A **Clerk** account (for authentication)
- A **Supabase** account (for database)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ShaswatApp
```

### 2. Install Dependencies

```bash
npm install
```

or if you're using yarn:

```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase Database
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### How to Get Your Keys:

**Clerk:**
1. Go to [Clerk.com](https://clerk.com) and sign up/sign in
2. Create a new application
3. Navigate to **API Keys** in your dashboard
4. Copy the **Publishable Key**

**Supabase:**
1. Go to [Supabase](https://supabase.com) and sign up/sign in
2. Create a new project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

### 4. Set Up the Database

Run the database schema in your Supabase project:

1. Open your Supabase dashboard
2. Go to the **SQL Editor**
3. Open and run the SQL script located at `supabase/schema.sql`

This will create all the necessary tables:
- `shops` - Store shop information
- `skus` - Product SKUs
- `orders` - Customer orders
- `return_orders` - Return orders
- `deliveries` - Delivery tracking
- `surveys` - Survey responses
- `employees` - Employee data

### 5. Run the Application

Start the development server:

```bash
npm start
```

or with yarn:

```bash
yarn start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.

## Project Structure

```
ShaswatApp/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable React components
│   │   ├── auth/        # Authentication components
│   │   └── ...
│   ├── config/          # Configuration files (Clerk, etc.)
│   ├── models/          # TypeScript interfaces and types
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages (Analytics, etc.)
│   │   └── ...
│   ├── services/        # Business logic and state management
│   ├── utils/           # Utility functions and Supabase client
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── supabase/            # Database schema and migrations
├── backend/             # Backend data and configurations
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Key Features Explained

### Authentication Flow

- Users must sign in/sign up using Clerk
- Authentication state is managed globally
- Protected routes require authentication
- Sign in/Sign up pages with custom styling

### Shop Management

- Add new shops with details (name, location, phone, category)
- Edit existing shop information
- View all shops in a searchable list
- Categorize shops as wholesalers or retailers

### Order Processing

1. Select a shop
2. Add products (SKUs) with quantities
3. Apply discount codes (optional)
4. Generate order summary
5. Track order status

### Delivery Management

- Assign deliveries to orders
- Track delivery status (Pending, In Transit, Delivered, Failed)
- Add delivery notes
- Schedule delivery dates

### Analytics Dashboard

- View sales metrics
- Track order statistics
- Monitor delivery performance
- Employee performance tracking

## Troubleshooting

### App won't start

- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is 16 or higher: `node --version`
- Verify environment variables are set correctly in `.env.local`

### Authentication errors

- Verify your Clerk publishable key is correct
- Check that your Clerk application is active
- Ensure you're using the correct Clerk domain

### Database connection issues

- Verify Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure database schema has been run
- Check network connectivity

### Build errors

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear build cache: `rm -rf build`

## Development

### Adding New Features

1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add routes in `src/App.tsx`
4. Update database schema in `supabase/schema.sql` if needed

### Code Style

- Use TypeScript for type safety
- Follow Material-UI design patterns
- Use functional components with hooks
- Keep components small and focused

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Environment Variables in Production

Make sure to set the following environment variables in your hosting platform:

- `REACT_APP_CLERK_PUBLISHABLE_KEY`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### Recommended Hosting Platforms

- **Vercel** - Zero-config deployment for React apps
- **Netlify** - Easy deployment with continuous integration
- **AWS Amplify** - Full-stack hosting solution
- **Firebase Hosting** - Google's hosting platform

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Supabase and Clerk documentation
3. Check browser console for error messages

## License

Private - All rights reserved

## Acknowledgments

- Material-UI for the component library
- Clerk for authentication services
- Supabase for the backend infrastructure
- React team for the amazing framework