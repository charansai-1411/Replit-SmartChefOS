# Step-by-Step Guide: Setting Up Neon Database

## Step 1: Create Neon Account & Database

1. **Go to https://neon.tech**
2. **Click "Sign Up"** (use GitHub, Google, or email)
3. **After login, click "Create a project"**
4. **Fill in the details:**
   - Project name: `SmartChefOS` (or any name you like)
   - Region: Choose closest to you
   - PostgreSQL version: 16 (recommended)
5. **Click "Create project"**

## Step 2: Get Your Connection String

1. **In your Neon dashboard**, you'll see your project
2. **Click on your project** to open it
3. **Look for "Connection string"** section
4. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
5. **Keep this safe** - you'll need it in the next steps

## Step 3: Export Data from Replit (Optional)

**If you have data in Replit that you want to keep:**

1. **In Replit**, make sure your DATABASE_URL is set
2. **In your local project**, update `.env` with Replit's DATABASE_URL temporarily
3. **Run the export command:**
   ```bash
   npm run export-data
   ```
4. This creates a `data-export.json` file with all your data

**If you don't have data in Replit or want fresh data:**
- Skip this step - we'll seed the database with sample data later

## Step 4: Set Up New Neon Database

1. **Update your `.env` file** with the Neon connection string:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
   (Replace with your actual connection string from Step 2)

2. **Push the database schema:**
   ```bash
   npm run db:push
   ```
   This creates all the tables in your Neon database.

## Step 5: Import Data

**Option A: If you exported data from Replit:**
```bash
npm run import-data
```

**Option B: If you want fresh sample data:**
```bash
npm run seed
```

## Step 6: Verify Everything Works

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:5000`

3. **Check:**
   - Dashboard should show analytics data
   - Customers page should show customers
   - Order Line should show dishes with images
   - Manage Dishes should show all dishes

## Troubleshooting

**If you get connection errors:**
- Double-check your DATABASE_URL in `.env`
- Make sure it includes `?sslmode=require` at the end
- Verify your Neon database is running (check Neon dashboard)

**If tables aren't created:**
- Run `npm run db:push` again
- Check for any error messages

**If data doesn't import:**
- Check the console for error messages
- Make sure `data-export.json` exists (if importing)
- Try running `npm run seed` for fresh data

## You're Done! 🎉

Your app is now using Neon database. The connection string in your `.env` file is what your app uses to connect.

