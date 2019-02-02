const redis = require('redis');
const util = require('util');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const redisClient = redis.createClient(keys.redisUrl);
redisClient.hget = util.promisify(redisClient.hget);

const exec = mongoose.Query.prototype.exec;


mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cacheValue = await redisClient.hget(this.hashKey, key);

    if (cacheValue) {
        let temp = JSON.parse(cacheValue);

        return Array.isArray(temp) ?
            temp.map(item => new this.model(item)) :
            new this.model(temp)

    }

    const queryResult = await exec.apply(this, arguments);

    redisClient.hset(this.hashKey, key, JSON.stringify(queryResult), 'EX', 10);

    return queryResult;
}

module.exports = {
    clearHash(key) {
        redisClient.del(JSON.stringify(key))
    }
}


