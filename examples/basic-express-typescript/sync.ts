
import * as sync from '../../fh-sync'
import * as Promise from 'bluebird'

// Sync framework requires mongodb and redis to be running
const MONGO_CONN_STRING = process.env.MONGO_CONNECTION_URL || 'mongodb://127.0.0.1:27017/sync';
const REDIS_CONN_STRING = process.env.REDIS_CONNECTION_URL || 'redis://127.0.0.1:6379';

// Options to pass to the mongodb driver
const MONGO_OPTS = {}

// Define our dataset name and the option such as how often to sync to system of record
const DATASET_NAME = 'messages'
const DATASET_OPTS = {
  syncFrequency: 10 // seconds
};

interface Query {
  username: string
}

interface Meta {
  trackingId: string
}

function initialiseDataset () {
  return new Promise((resolve, reject) => {
    sync.init(DATASET_NAME, DATASET_OPTS, (err) => {
      if (err) {
        reject(err)
      } else {
        // Sample list handler. Uses a custom query and metadata interface to provide
        // better typings in the handler logic.
        sync.handleList(DATASET_NAME, (dataset, query: Query, meta: Meta, done) => {
          console.log(`received request from ${query.username} with tracking ID ${meta.trackingId}`)

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
          })
        })

        resolve()
      }
    })
  })
}

function connect () {
  return new Promise((resolve, reject) => {
    sync.connect(MONGO_CONN_STRING, MONGO_OPTS, REDIS_CONN_STRING, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    });
  })
}

export function init () {
  return connect().then(initialiseDataset)
}
