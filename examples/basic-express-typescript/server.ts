
import * as express from 'express'
import * as sync from './sync'
import syncRouter from './route'

const app = express()

sync.init()
  .then(startApplicationServer)
  .catch((e) => {
    console.log('error occurred during startup', e)
    process.exit(1)
  })

function startApplicationServer (err: any) {
  if (err) {
    console.log('error starting sync server:')
    throw err
  }

  console.log('Sync initialised')

  // Sync express api required for sync clients. All sync clients will call this endpoint to sync data
  app.use('/sync', syncRouter)

  // Default route. Can be used to check application is up and running
  app.get('/', (req, res) => {
    res.send('Sample application is running!')
  })

  app.listen(3000, (err: any) => {
    if (err) throw err

    console.log('\nExample app listening on port 3000!')
    console.log('\nRun the following from a terminal to get records via sync:')
    console.log('curl http://localhost:3000/sync/messages -X POST --data \'{"fn": "syncRecords"}\' -H "content-type:application/json"\n')
  });
}
