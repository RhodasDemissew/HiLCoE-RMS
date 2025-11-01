import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const SOURCE_URI = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI; // Source: Atlas cluster
const TARGET_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/hilcoe_rms'; // Target: Local MongoDB

// Extract database name from URI or use default
function extractDbName(uri) {
  const match = uri.match(/\/([^/?]+)(?:\?|$)/);
  return match ? match[1] : 'hilcoe_rms';
}

if (!SOURCE_URI || !TARGET_URI) {
  console.error('❌ Please set MONGO_URI_ATLAS and MONGO_URI_LOCAL in your .env file');
  console.error('   Or set MONGO_URI_ATLAS to your Atlas URI and MONGO_URI_LOCAL to local URI');
  console.error('   Example: MONGO_URI_LOCAL=mongodb://localhost:27017/hilcoe_rms');
  process.exit(1);
}

async function migrateCollection(sourceDb, targetDb, collectionName) {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  try {
    const sourceCollection = sourceDb.collection(collectionName);
    const targetCollection = targetDb.collection(collectionName);
    
    // Get count
    const count = await sourceCollection.countDocuments();
    console.log(`   Found ${count} documents`);
    
    if (count === 0) {
      console.log(`   ⏭️  Skipping empty collection`);
      return { copied: 0, skipped: 0 };
    }
    
    // Fetch all documents
    const documents = await sourceCollection.find({}).toArray();
    
    // Clear target collection first (optional - comment out if you want to merge instead)
    const existingCount = await targetCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`   🗑️  Clearing ${existingCount} existing documents from target`);
      await targetCollection.deleteMany({});
    }
    
    // Insert all documents
    if (documents.length > 0) {
      await targetCollection.insertMany(documents, { ordered: false });
      console.log(`   ✅ Copied ${documents.length} documents`);
      return { copied: documents.length, skipped: 0 };
    }
    
    return { copied: 0, skipped: 0 };
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    return { copied: 0, skipped: 1 };
  }
}

async function main() {
  let sourceClient, targetClient;
  let sourceDb, targetDb;
  
  try {
    console.log('🔄 Starting migration from Atlas to Local MongoDB...\n');
    console.log(`📤 Source: ${SOURCE_URI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`📥 Target: ${TARGET_URI}\n`);
    
    // Connect to source (Atlas)
    console.log('🔌 Connecting to source database (Atlas)...');
    sourceClient = new MongoClient(SOURCE_URI);
    await sourceClient.connect();
    // Extract db name from connection string or use the one we extracted
    const sourceDbName = extractDbName(SOURCE_URI);
    sourceDb = sourceClient.db(sourceDbName);
    console.log(`✅ Connected to source database: ${sourceDbName}`);
    
    // Connect to target (Local)
    console.log('🔌 Connecting to target database (Local)...');
    targetClient = new MongoClient(TARGET_URI);
    await targetClient.connect();
    // Extract db name from connection string or use the one we extracted
    const targetDbName = extractDbName(TARGET_URI);
    targetDb = targetClient.db(targetDbName);
    console.log(`✅ Connected to target database: ${targetDbName}`);
    
    // Get all collection names from source
    console.log('\n📋 Fetching collection list...');
    const collections = await sourceDb.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));
    
    console.log(`\n📊 Found ${collectionNames.length} collections to migrate:`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    
    // Migrate each collection
    let totalCopied = 0;
    let totalSkipped = 0;
    
    for (const collectionName of collectionNames) {
      const result = await migrateCollection(sourceDb, targetDb, collectionName);
      totalCopied += result.copied;
      totalSkipped += result.skipped;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Collections migrated: ${collectionNames.length}`);
    console.log(`   📄 Total documents copied: ${totalCopied}`);
    if (totalSkipped > 0) {
      console.log(`   ⚠️  Collections with errors: ${totalSkipped}`);
    }
    console.log('='.repeat(50));
    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update your .env file: MONGO_URI=mongodb://localhost:27017/hilcoe_rms');
    console.log('   2. Restart your backend server');
    console.log('   3. Your application will now use local MongoDB');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close connections
    if (sourceClient) {
      await sourceClient.close();
      console.log('\n🔌 Disconnected from source database');
    }
    if (targetClient) {
      await targetClient.close();
      console.log('🔌 Disconnected from target database');
    }
    process.exit(0);
  }
}

main();

