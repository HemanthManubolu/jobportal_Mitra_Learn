import mongoose from "mongoose";
import dns from "dns";
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

// Module instances can be reused by Vercel's Fluid compute. Cache both the
// established connection and an in-flight attempt so concurrent invocations do
// not open unnecessary MongoDB connections.
const connectionCache = globalThis.__jobPortalMongooseConnection || {
    client: null,
    promise: null,
};
globalThis.__jobPortalMongooseConnection = connectionCache;

const connectDB = async () => {
    if (connectionCache.client && mongoose.connection.readyState === 1) {
        return connectionCache.client;
    }

    if (mongoose.connection.readyState === 1) {
        connectionCache.client = mongoose;
        return mongoose;
    }

    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.');

    if (connectionCache.promise) return connectionCache.promise;

    connectionCache.promise = mongoose.connect(process.env.MONGO_URI)
        .then((client) => {
            connectionCache.client = client;
            console.log('mongodb connected successfully');
            return client;
        })
        .catch((error) => {
            console.error('MongoDB connection failed:', error.message);
            throw error;
        })
        .finally(() => {
            connectionCache.promise = null;
        });

    return connectionCache.promise;
}
export default connectDB;
