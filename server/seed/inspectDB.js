// Local debug script: connects to whatever MONGO_URI is set in .env
// and prints out the mobilemate database's collections + sample docs.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { MongoClient } = require('mongoose').mongo;

(async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const db = client.db('mobilemate');
  const collections = await db.listCollections().toArray();

  console.log(`\n=== Database: mobilemate ===`);
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`\n  - Collection: ${col.name}  (${count} documents)`);
    const sample = await db.collection(col.name).find().limit(3).toArray();
    console.log(JSON.stringify(sample, null, 2));
  }

  await client.close();
})();
