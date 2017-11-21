"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sync = require("../../fh-sync");
var Promise = require("bluebird");
var MONGO_CONN_STRING = process.env.MONGO_CONNECTION_URL || 'mongodb://127.0.0.1:27017/sync';
var REDIS_CONN_STRING = process.env.REDIS_CONNECTION_URL || 'redis://127.0.0.1:6379';
var MONGO_OPTS = {};
var DATASET_NAME = 'messages';
var DATASET_OPTS = {
    syncFrequency: 10
};
function initialiseDataset() {
    return new Promise(function (resolve, reject) {
        sync.init(DATASET_NAME, DATASET_OPTS, function (err) {
            if (err) {
                reject(err);
            }
            else {
                sync.handleList(DATASET_NAME, function (dataset, query, meta, done) {
                    console.log("received request from " + query.username + " with tracking ID " + meta.trackingId);
                    done(null, {
                        '00001': {
                            'item': 'item1'
                        },
                        '00002': {
                            'item': 'item2'
                        },
                        '00003': {
                            'item': 'item3'
                        }
                    });
                });
                resolve();
            }
        });
    });
}
function connect() {
    return new Promise(function (resolve, reject) {
        sync.connect(MONGO_CONN_STRING, MONGO_OPTS, REDIS_CONN_STRING, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
function init() {
    return connect().then(initialiseDataset);
}
exports.init = init;
//# sourceMappingURL=sync.js.map