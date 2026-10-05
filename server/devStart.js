require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

(async () => {
  if (!process.env.MONGO_URI) {
    const { MongoMemoryReplSet } = require('mongodb-memory-server');
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGO_URI = replSet.getUri();
    console.log('No MONGO_URI set — using temporary in-memory MongoDB replica set for this run.');
    console.log(`In-memory MongoDB URI: ${process.env.MONGO_URI}`);
    fs.writeFileSync(path.join(__dirname, '.dev-mongo-uri'), process.env.MONGO_URI);
  }

  const connectDB = require('./config/db');
  await connectDB();

  const User = require('./models/User');
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@mobilemate.com';
  const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const exists = await User.findOne({ email });
  if (!exists) {
    const password = await bcrypt.hash(plainPassword, await bcrypt.genSalt(10));
    await User.create({ name: 'Shop Admin', email, password, role: 'admin' });
    console.log(`Seeded admin account -> email: ${email}  password: ${plainPassword}`);
  }

  const app = require('./app');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`MobileMate API listening on port ${PORT}`));
})();
