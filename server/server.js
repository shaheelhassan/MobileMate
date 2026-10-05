require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const WEAK_SECRETS = ['local_dev_secret_change_me_before_deploy', 'secret', 'changeme', ''];
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
    console.error('Refusing to start: JWT_SECRET is missing or using a known-weak default. Set a long random JWT_SECRET before deploying to production.');
    process.exit(1);
  }
}

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MobileMate API listening on port ${PORT}`));
