const dns = require('dns');
const mongoose = require('mongoose');

// Some networks (e.g. phone hotspots) break the DNS lookups a mongodb+srv:// URI needs:
// the SRV answer comes back malformed (EBADRESP) and TXT queries are dropped entirely.
const isSrvLookupFailure = (error) => /^query(Srv|Txt)/.test(error.message);

// Rebuilds the mongodb+srv:// URI as a plain host-list URI, resolving the hosts through
// public DNS — this skips the TXT lookup and the local resolver altogether.
const buildDirectUri = async (srvUri) => {
  const url = new URL(srvUri);
  const resolver = new dns.promises.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const records = await resolver.resolveSrv(`_mongodb._tcp.${url.hostname}`);
  const hosts = records.map(record => `${record.name}:${record.port}`).join(',');

  // These are the defaults Atlas would otherwise have supplied via the TXT record
  const params = new URLSearchParams(url.search);
  params.set('tls', 'true');
  if (!params.has('authSource')) params.set('authSource', 'admin');

  const credentials = url.username ? `${url.username}:${url.password}@` : '';
  return `mongodb://${credentials}${hosts}${url.pathname}?${params}`;
};

const connectDB = async () => {
  try {
    let conn;
    try {
      conn = await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
      if (!process.env.MONGO_URI.startsWith('mongodb+srv://') || !isSrvLookupFailure(error)) throw error;

      console.warn(`[SYSTEM] Local DNS couldn't resolve the MongoDB cluster (${error.code}), connecting to its hosts directly`);
      conn = await mongoose.connect(await buildDirectUri(process.env.MONGO_URI));
    }
    console.log(`[SYSTEM] MongoDB Cluster connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CRITICAL] MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
