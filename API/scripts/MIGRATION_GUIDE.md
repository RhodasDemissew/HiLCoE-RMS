# Migration Guide: Atlas → Local MongoDB

This guide will help you migrate your database from MongoDB Atlas to your local MongoDB instance for offline presentations.

## Prerequisites

1. **MongoDB Atlas Access**: You need to run the migration while connected to WiFi (to access Atlas)
2. **Local MongoDB Running**: Make sure your local MongoDB is running on `localhost:27017`
3. **Database Name**: Your database is named `hilcoe_rms` (both Atlas and local)

## Step 1: Prepare Your Environment

Add these to your `.env` file in the `API` folder:

```env
# Your Atlas connection string (for migration source)
MONGO_URI_ATLAS=mongodb+srv://username:password@rmscluster.9x7mji2.mongodb.net/hilcoe_rms?retryWrites=true&w=majority

# Your local MongoDB connection string (for migration target)
MONGO_URI_LOCAL=mongodb://localhost:27017/hilcoe_rms
```

**Or** if you only want to set `MONGO_URI_LOCAL`, the script will use your current `MONGO_URI` as the source.

## Step 2: Verify Local MongoDB is Running

Open MongoDB Compass and verify you can connect to `mongodb://localhost:27017`

Or check via command line:
```bash
mongosh mongodb://localhost:27017
```

## Step 3: Run the Migration

**While connected to WiFi** (to access Atlas), run:

```bash
cd API
npm run migrate:local
```

The script will:
- ✅ Connect to both Atlas (source) and Local (target)
- ✅ List all collections
- ✅ Copy all documents from each collection
- ✅ Clear existing data in local (optional - you can modify the script to merge instead)
- ✅ Show a summary of what was migrated

## Step 4: Switch to Local MongoDB

After migration completes:

1. **Update your `.env` file**:
   ```env
   MONGO_URI=mongodb://localhost:27017/hilcoe_rms
   ```

2. **Restart your backend**:
   ```bash
   npm run dev
   ```

3. **Verify connection** - You should see:
   ```
   ✅ Successfully connected to MongoDB!
   ```

## Step 5: Test Your Application

1. Start the backend: `npm run dev`
2. Test API endpoints
3. Verify data is accessible

## Alternative: Manual Export/Import (If Script Fails)

If the migration script doesn't work, you can use MongoDB's native tools:

### Export from Atlas (on WiFi):
```bash
mongodump --uri="mongodb+srv://username:password@rmscluster.9x7mji2.mongodb.net/hilcoe_rms" --out=./backup
```

### Import to Local:
```bash
mongorestore --uri="mongodb://localhost:27017/hilcoe_rms" ./backup/hilcoe_rms
```

## Troubleshooting

**Issue**: "Failed to connect to Atlas"
- **Solution**: Make sure you're on WiFi, not mobile hotspot

**Issue**: "Failed to connect to local MongoDB"
- **Solution**: Make sure MongoDB is running locally. Start it via MongoDB Compass or Windows Services

**Issue**: "Database name mismatch"
- **Solution**: Check that both databases use `hilcoe_rms` or update the script's `DB_NAME` constant

**Issue**: "Some collections failed to migrate"
- **Solution**: Check the error messages. You can run the migration again - it will clear and re-copy data

## After Presentation

To switch back to Atlas after your presentation:
1. Update `.env`: `MONGO_URI=your_atlas_connection_string`
2. Restart backend

---

**Note**: The migration script **clears** existing local data before importing. If you want to merge instead of replace, modify the script in `API/scripts/migrate-to-local.js` (look for the `deleteMany` call).


