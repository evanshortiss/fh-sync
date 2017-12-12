// Type definitions for fh-sync
// Project: https://github.com/feedhenry/fh-sync
// Maintainer feedhenry-dev@redhat.com

declare module SyncCloud {

      /**
       * Backoff strategies that can be passed to workers
       */
      type WorkerBackoffStrategy = 'fib'|'exp'

      /**
       * Valid actions (the "fn" param) that can be passed to sync.invoke
       */
      type InvokeAction = 'sync'|'syncRecords'|'listCollisions'|'removeCollision'

      /**
       * Options that can be passed to sync.invoke
       */
      interface InvokeOptions {
          fn: InvokeAction

          // TODO: we should define this in more detail
          [key: string]: any
      }

      /**
       * Interfaces that describe how sync responses should be structured
       */
      namespace HandlerResults {
          interface Create {
              uid: string
              data: Object
          }

          interface Read {
              [key: string]: any
          }

          interface Update {
              [key: string]: any
          }

          interface Delete {
              [key: string]: any
          }

          interface List {
              [uid: string]: Object
          }
      }

      /**
       * Unique callback structures for sync handlers.
       *
       * Can be used by other modules to create pre-built sync compliant handlers.
       */
      namespace HandlerFunctions {
          type Create = (dataset: string, data: Object, metaData: any, done: StandardCb<HandlerResults.Create>) => void
          type Read = (dataset: string, uid: string, metaData: any, done: StandardCb<HandlerResults.Read>) => void
          type Update = (dataset: string, uid: string, metaData: any, done: StandardCb<HandlerResults.Update>) => void
          type Delete = (dataset: string, queryParams: any, metaData: any, done: StandardCb<HandlerResults.Delete>) => void
          type List = (dataset: string, queryParams: any, metaData: any, done: StandardCb<HandlerResults.List>) => void
          type Collision = (datasetId: string, hash: string, timestamp: number, uid: string, pre: Object, post: Object, metaData: any, callback: StandardCb<any>) => void
          type ListCollisions = (datasetId: string, metaData: any, callback: StandardCb<{ [hash: string]: Object }>) => void
          type RemoveCollision = (datasetId: string, collision_hash: string, metaData: any, callback: StandardCb<any>) => void
          type Interceptor = (datasetId: string, interceptorParams: SyncInterceptParams, callback: NoRespCb) => void
          type Hash = (data: any) => string
      }

      /**
       * Options used to initialize Sync Server
       */
      interface SyncGlobalOptions {
          /** How often pending workers should check for the next job, in ms. Default: 1 */
          pendingWorkerInterval?: number;
          /** The concurrency value of the pending workers. Default is 1. Can set to 0 to disable the pendingWorkers completely */
          pendingWorkerConcurrency?: number;
          /** The backoff strategy for the pending worker to use.
           * Default strategy is `exp` (exponential) with a max delay of 60s. The min value will always be the same as `pendingWorkerInterval`
           * The other valid strategy is `fib` (fibonacci). Set it to anything else will disable the backoff behavior */
          pendingWorkerBackoff?: PendingWorkerBackoff;
          /** How often ack workers should check for the next job, in ms. Default: 1 */
          ackWorkerInterval?: number;
          /** The concurrency value of the ack workers. Default is 1. Can set to 0 to disable the ackWorker completely */
          ackWorkerConcurrency?: number;
          /**
           * The backoff strategy for the ack worker to use.
           * Default strategy is `exp` (exponential) with a max delay of 60s. The min value will always be the same as `ackWorkerInterval`
           * The other valid strategy is `fib` (fibonacci). Set it to anything else will disable the backoff behavior  */
          ackWorkerBackoff?: AckWorkerBackoff;
          /** How often sync workers should check for the next job, in ms. Default: 100 */
          syncWorkerInterval?: number;
          /** The concurrency value of the sync workers. Default is 1. Can set to 0 to disable the syncWorker completely. */
          syncWorkgerConcurrency?: number;
          /** the backoff strategy for the sync worker to use.
           * Default strategy is `exp` (exponential) with a max delay of 1s. The min value will always be the same as `syncWorkerInterval`
           * Other valid strategies are `none` and `fib` (fibonacci).*/
          syncWorkerBackoff?: SyncWorkerBackoff;
          /** How often the scheduler should check the datasetClients, in ms. Default: 500 */
          schedulerInterval?: number;
          /** The max time a scheduler can hold the lock for, in ms. Default: 20000 */
          schedulerLockMaxTime?: number;
          /** The default lock name for the sync scheduler */
          schedulerLockName?: string;
          /** The default concurrency value when update dataset clients in the sync API. Default is 10. In most case this value should not need to be changed */
          datasetClientUpdateConcurrency?: number;
          /** Enable/disable collect sync stats to allow query via an endpoint */
          collectStats?: boolean;
          /** The number of records to keep in order to compute the stats data. Default is 1000. */
          statsRecordsToKeep?: number;
          /** How often the stats should be collected. In milliseconds. */
          collectStatsInterval?: number;
          /** The host of the influxdb server. If set, the metrics data will be sent to the influxdb server. */
          metricsInfluxdbHost?: string;
          /** The port of the influxdb server. It should be a UDP port. */
          metricsInfluxdbPort?: number;
          /** The concurrency value for the component metrics. Default is 10. This value should be increased if there are many concurrent workers. Otherwise the memory useage of the app could go up.*/
          metricsReportConcurrency?: number;
          /** If cache the dataset client records using redis. This can help improve performance for the syncRecords API.
           * Can be turned on if there are no records are shared between many different dataset clients. Default is false.*/
          useCache?: boolean;
          /**The TTL (Time To Live) value for the messages on the queue. In seconds. Default to 24 hours. */
          queueMessagesTTL?: string;
          /** Specify the maximum retention time of an inactive datasetClient. Any inactive datasetClient that is older than this period of time will be removed.*/
          datasetClientCleanerRetentionPeriod?: string;
          /** Specify the frequency the datasetClient cleaner should run. Default every hour ('1h').*/
          datasetClientCleanerCheckFrequency?: string;
      }

      /**
       * Backoff Strategy
       * Example: {strategy: 'exp', max: 60*1000},
       */
      interface PendingWorkerBackoff {
          strategy?: WorkerBackoffStrategy;
          max: number;
      }
      /**
       * Backoff Strategy
       * Example: {strategy: 'exp', max: 60*1000},
       */
      interface AckWorkerBackoff {
          strategy: string;
          max: number;
      }

      /**
       * Backoff Strategy
       * Example: {strategy: 'exp', max: 60*1000},
       */
      interface SyncWorkerBackoff {
          strategy: string;
          max: number;
      }

      type StandardCb<T> = (err: Error | null | string | undefined, res?: T | undefined) => void;
      type NoRespCb = (err: Error | string | undefined) => void;

      /**
       * Options used to initialize sync for specific dataset
       */
      interface SyncInitOptions {
          /**
           * Value indicating how often the dataset client should be sync with the backend. Matches the clients default
           * frequency. Value in seconds
           */
          syncFrequency?: number,

          /**
           * Value that will be used to decide if the dataset client is not active anymore.
           */
          clientSyncTimeout?: number,

          /**
           * Value that determines how long it should wait for the backend list operation to complete
           */
          backendListTimeout?: number,

          /**
           * Specify the max wait time the dataset can be scheduled to sync again after its previous schedule, in seconds.
           */
          maxScheduleWaitTime?: number
      }

      /**
       * Parameters object for request and response interceptors
       */
      interface SyncInterceptParams {
          query_params: any;
          metaData: any;
      }
      /**
       * Connect sync server to mongo and redis. Returns the MongoDB and Redis clients being used internally.
       *
       * @param mongoDBConnectionUrl - Unique id of the dataset (usually collection, table in your database)
       * @param mongoDBConnectionOption - Connection options for the MongoDB driver
       * @param redisUrl - Redis connection URL
       * @param callback - Callback that will be invoked once connections are setup
       */
      function connect(mongoDBConnectionUrl: string, mongoDBConnectionOption: any, redisUrl: string, callback: (err: any, mongoDbClient?: any, redisClient?: any) => void): void;

      /**
       * Initialize sync for specific dataset. The passed datasetId must be a unique string.
       *
       * @param datasetId - Unique name of the dataset to initialise
       * @param options - Specific options to apply to this dataset
       * @param callback - Callback that will be invoked once initialisation is complete
       */
      function init(datasetId: string, options: SyncInitOptions, callback: NoRespCb): void;

      /**
       * Internal method used to invoke sync methods. Should be used to handle json request from client.
       *
       * Supported operations are 'sync', 'syncRecords', 'listCollisions', 'removeCollision' and should be passed as a
       * "fn" key in the options object.
       *
       * @param datasetId - The dataset to invoke the operation on
       * @param options - Options to pass to the invocation
       * @param callback - Function that will receive the invocation results
       */
      function invoke(datasetId: string, options: InvokeOptions, callback: StandardCb<any>): void;

      /**
       * Stop sync loop for the given datasetId. Invokes the passed callback once all operations are stopped.
       *
       * @param datasetId - The dataset to stop syncing
       * @param onStop - Callback to invoke once operations have stopped
       */
      function stop(datasetId: string, onStop: NoRespCb): void;

      /**
       * Stop sync loop for all datasets. Invokes the passed callback once all operations are stopped.
       *
       * @param onStop - Callback to invoke once operations have stopped
       */
      function stopAll(onStop: StandardCb<string[]>): void;

      /**
       * Provide a custom list implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onList - Implementation of the handler
       */
      function handleList(datasetId: string, onList: HandlerFunctions.List): void;

      /**
       * Provide a custom implementation of the list operation for all datasets
       *
       * @param onList - Implementation of the handler
       */
      function globalHandleList(onList: HandlerFunctions.List): void;

      /**
       * Provide a custom create implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onCreate - Implementation of the handler
       */
      function handleCreate(datasetId: string, onCreate: HandlerFunctions.Create): void;

      /**
       * Provide a custom implementation of the create operation for all datasets
       *
       * @param onCreate - Implementation of the handler
       */
      function globalHandleCreate(onCreate: HandlerFunctions.Create): void;

      /**
       * Provide a custom read implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onRead - Implementation of the handler
       */
      function handleRead(datasetId: string, onRead: HandlerFunctions.Read): void;

      /**
       * Provide a custom implementation of the read operation for all datasets.
       *
       * @param onRead - Implementation of the handler
       */
      function globalHandleRead(onRead: HandlerFunctions.Read): void;

      /**
       * Provide a custom update implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onUpdate - Implementation of the handler
       */
      function handleUpdate(datasetId: string, onUpdate: HandlerFunctions.Update): void;

      /**
       * Provide a custom implementation of the update handler for all datasets.
       *
       * @param onUpdate - Implementation of the handler
       */
      function globalHandleUpdate(onUpdate: HandlerFunctions.Update): void;

      /**
       * Provide a custom delete implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onDelete - Implementation of the handler
       */
      function handleDelete(datasetId: string, onDelete: HandlerFunctions.Delete): void;

      /**
       * Provide a custom implementation of the delete handler for all datasets.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onDelete - Implementation of the handler
       */
      function globalHandleDelete(onDelete: HandlerFunctions.Delete): void;

      /**
       * Provide a custom collision handler implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onCollision - Implementation of the handler
       */
      function handleCollision(datasetId: string, onCollision: HandlerFunctions.Collision): void;

      /**
       * Provide a custom implementation of the collision handler for all datasets.
       *
       * @param onCollision - Implementation of the handler
       */
      function globalHandleCollision(onCollision: HandlerFunctions.Collision): void;

      /**
       * Provide a custom collision list handler implementation for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onList - Implementation of the handler
       */
      function listCollisions(datasetId: string, onList: HandlerFunctions.ListCollisions): void;

      /**
       * Provide a custom implementation of the list collision handler for all datasets.
       *
       * @param onList - Implementation of the handler
       */
      function globalListCollisions(onList: HandlerFunctions.ListCollisions): void;

      /**
       * Provide a custom collision removal handler for the specified dataset.
       *
       * @param datasetId - The dataset to apply the given handler to
       * @param onRemove - Implementation of the handler
       */
      function removeCollision(datasetId: string, onRemove: HandlerFunctions.RemoveCollision): void;

      /**
       * Allows developers to provide a request interceptor for the given datasetId. Facilitates performing custom
       * operations prior to invoking the required sync method.
       *
       * Useful for performing authorisation checks, logging, etc.
       *
       * @param datasetId - The dataset to apply the given interceptor to
       * @param onIntercept - Implementation of the interceptor
       */
      function interceptRequest(datasetId: string, onIntercept: HandlerFunctions.Interceptor): void;

      /**
       * Allows developers to provide a response interceptor for the given datasetId. Facilitates performing custom
       * operations after internal sync operations have completed.
       *
       * @param datasetId - The dataset to apply the given interceptor to
       * @param onIntercept - Implementation of the interceptor
       */
      function interceptResponse(datasetId: string, onIntercept: HandlerFunctions.Interceptor): void;

      /**
       * Override global options utilised by the library.
       * @param config - The configuration overrides to apply
       */
      function setConfig(config: SyncGlobalOptions): void;

      /**
       * Allows developers to provide a global request interceptor. Facilitates performing custom operations prior to
       * invoking the required sync method. Useful for performing authorisation checks, logging, etc.
       *
       * @param onIntercept - The function to use as interceptor for all collection requests
       */
      function globalInterceptRequest(onIntercept: HandlerFunctions.Interceptor): void;

      /**
       * Allows developers to provide a response interceptor for all datasets. Facilitates performing custom operations
       * after internal sync operations have completed.
       *
       * @param onIntercept - The function to use as interceptor for all collection resposnes
       */
      function globalInterceptResponse(onIntercept: HandlerFunctions.Interceptor): void;

      /**
       * Sets a custom global hashing method. This is used to determine if a difference exists between the previous and
       * current state of a record.
       *
       * @param hashFunction - The custom hashing implementation to use for all datasets
       */
      function setGlobalHashFn(datasetId: string, hashFunction: HandlerFunctions.Hash): void;

      /**
       * Sets a custom hashing method for the given datasetId. This is used to determine if a difference exists between
       * the previous and current state of a record.
       *
       * @param datasetId - The custom hashing implementation to use for the given datasetId
       * @param hashFunction - The custom hashing implementation to use for the given datasetId
       */
      function setRecordHashFn(datasetId: string, hashFunction: HandlerFunctions.Hash): void;
  }
  export = SyncCloud;
