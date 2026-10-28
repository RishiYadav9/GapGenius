import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'gapgenius';

console.log('=== GapGenius MongoDB Atlas Verification Test ===');
console.log(`Database Target: ${dbName}`);
console.log(`Cluster URI: ${uri ? uri.replace(/:([^@]+)@/, ':****@') : 'NOT_FOUND'}`);

if (!uri) {
  console.error('ERROR: MONGODB_URI is not defined in .env');
  process.exit(1);
}

const runTest = async () => {
  try {
    console.log('\n[1/4] Connecting to MongoDB Atlas...');
    const startConnect = Date.now();
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });
    const connectDuration = Date.now() - startConnect;
    console.log(`✓ Connected successfully in ${connectDuration}ms!`);
    console.log(`  - Database Name: ${mongoose.connection.name}`);
    console.log(`  - Host: ${mongoose.connection.host}`);
    console.log(`  - Port: ${mongoose.connection.port}`);
    console.log(`  - Connection ReadyState: ${mongoose.connection.readyState}`);

    // [2/4] Define Test Schema
    console.log('\n[2/4] Defining Test Document Schema...');
    const ProbeSchema = new mongoose.Schema({
      testId: { type: String, required: true },
      project: { type: String, default: 'GapGenius' },
      verifiedAt: { type: Date, default: Date.now },
      metadata: {
        nodeVersion: String,
        platform: String,
        status: String
      }
    });

    const ProbeModel = mongoose.model('ConnectionProbe', ProbeSchema);

    // [3/4] Test Saving a Document
    const testId = `probe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`\n[3/4] Saving Test Document (testId: ${testId})...`);
    const docToSave = new ProbeModel({
      testId,
      project: 'GapGenius',
      verifiedAt: new Date(),
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        status: 'ATLAS_WRITE_VERIFIED'
      }
    });

    const savedDoc = await docToSave.save();
    console.log(`✓ Document saved successfully!`);
    console.log(`  - _id: ${savedDoc._id}`);
    console.log(`  - testId: ${savedDoc.testId}`);
    console.log(`  - verifiedAt: ${savedDoc.verifiedAt.toISOString()}`);
    console.log(`  - status: ${savedDoc.metadata.status}`);

    // [4/4] Test Reading Back the Document
    console.log(`\n[4/4] Reading back Document from Atlas by _id (${savedDoc._id})...`);
    const retrievedDoc = await ProbeModel.findById(savedDoc._id);
    if (!retrievedDoc) {
      throw new Error(`Failed to retrieve document with _id ${savedDoc._id}`);
    }
    console.log(`✓ Document read back successfully!`);
    console.log(`  - Retrieved testId: ${retrievedDoc.testId}`);
    console.log(`  - Retrieved Project: ${retrievedDoc.project}`);
    console.log(`  - Match Verified: ${retrievedDoc.testId === testId ? 'YES (100% Match)' : 'NO'}`);

    // Clean up test document
    console.log(`\n[Clean-up] Removing temporary test probe...`);
    await ProbeModel.findByIdAndDelete(savedDoc._id);
    console.log(`✓ Temporary probe document cleaned up.`);

    console.log('\n==================================================');
    console.log('   ALL MONGODB ATLAS VERIFICATION CHECKS PASSED!   ');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ MongoDB Atlas Verification Failed:');
    console.error(err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runTest();
