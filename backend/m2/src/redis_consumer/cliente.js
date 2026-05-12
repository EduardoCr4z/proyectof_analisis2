const { createClient } = require('redis');

const cliente_redis = createClient({
    url: 'redis://redis:6379'
});

cliente_redis.on('error', err => console.error('Redis error:', err));

async function connectRedis() {
    if (!cliente_redis.isOpen) {
        await cliente_redis.connect();
        console.log('Redis conectado');
    }
}

module.exports = {
    cliente_redis,
    connectRedis
};