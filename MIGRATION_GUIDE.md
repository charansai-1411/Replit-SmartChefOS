# Migration Guide: Moving from Replit to Neon Database

## Step 1: Create Neon Database Account

1. Go to https://neon.tech
2. Click "Sign Up" (you can use GitHub, Google, or email)
3. Complete the signup process

## Step 2: Create a New Database

1. After logging in, click "Create a project"
2. Choose a project name (e.g., "SmartChefOS")
3. Select a region closest to you
4. Choose PostgreSQL version (16 is recommended)
5. Click "Create project"

## Step 3: Get Your Connection String

1. Once your project is created, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
2. **Copy this connection string** - you'll need it in Step 6

## Step 4: Set Up the Database Schema

We'll use Drizzle to push the schema to your new Neon database.

## Step 5: Export Data from Replit (if needed)

If you have data in Replit, we can export it. Otherwise, we'll seed the new database.

## Step 6: Update Your Local .env File

Add the Neon connection string to your `.env` file.

## Step 7: Run Migrations and Seed Data

We'll push the schema and seed the database with your data.

