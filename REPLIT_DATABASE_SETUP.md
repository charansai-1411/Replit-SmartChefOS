# How to Use Your Replit Database Locally

## Step 1: Get DATABASE_URL from Replit

1. **Open your Replit project** in your browser
2. **Look for the Secrets/Environment Variables:**
   - Click on the **"Secrets"** tab in the left sidebar (lock icon)
   - OR look for **"Environment Variables"** in the Tools menu
   - OR check the **Console** and run: `echo $DATABASE_URL`
3. **Copy the DATABASE_URL** - it should look something like:
   ```
   postgresql://username:password@host:port/database
   ```

## Step 2: Update Your Local .env File

1. Open your `.env` file in this project
2. Replace the placeholder `DATABASE_URL` with the one from Replit:
   ```
   DATABASE_URL=postgresql://your-actual-connection-string-from-replit
   ```

## Step 3: Test the Connection

1. Restart your server: `npm run dev`
2. The database errors should disappear if the connection works

## Alternative: If Replit Database is Not Accessible Externally

If you can't connect to Replit's database from your local machine, you have two options:

### Option A: Export Data from Replit and Import Locally
1. In Replit, export your database data
2. Set up a local PostgreSQL or Neon database
3. Import the data

### Option B: Use Replit's Web Interface
Continue developing in Replit's browser interface where the database is already configured.

## Note About Images

The images in `attached_assets/generated_images/` are already in your project folder, so they should work locally once the database connection is fixed.

