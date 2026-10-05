const mongoose = require('mongoose');
const dnsSync = require('dns');
const dns = dnsSync.promises;

const retry = async (fn, attempts = 5, delayMs = 1500) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
};

const resolveSrvUri = async (srvUri) => {
  const match = srvUri.match(/^mongodb\+srv:\/\/(?:([^:]+):([^@]+)@)?([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) throw new Error('Invalid mongodb+srv connection string');
  const [, user, pass, host, dbPart, queryPart] = match;

  const srvRecords = await retry(() => dns.resolveSrv(`_mongodb._tcp.${host}`));
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  const params = new URLSearchParams(queryPart ? queryPart.slice(1) : '');
  try {
    const txtRecords = await retry(() => dns.resolveTxt(host));
    txtRecords
      .map((chunks) => chunks.join(''))
      .join('&')
      .split('&')
      .forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k && v && !params.has(k)) params.set(k, v);
      });
  } catch (err) {
    console.warn('TXT lookup for Atlas options failed after retries, continuing without it.');
  }
  if (!params.has('ssl') && !params.has('tls')) params.set('ssl', 'true');

  const userInfo = user ? `${user}:${pass}@` : '';
  const dbName = dbPart && dbPart !== '/' ? dbPart : '/';
  return `mongodb://${userInfo}${hosts}${dbName}?${params.toString()}`;
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri.startsWith('mongodb+srv://')) {
      dnsSync.setServers(['8.8.8.8', '1.1.1.1']);
      uri = await resolveSrvUri(uri);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
