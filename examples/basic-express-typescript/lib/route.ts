
import * as express from 'express'
import * as parsers from 'body-parser'
import * as cors from 'cors'
import * as sync from '../../../fh-sync'

const router = express.Router()

// Mobile clients typically require CORS headers to be set
router.use(cors())

// Need to parse incoming JSON bodies
router.use(parsers.json())

// All sync requests are performed using a HTTP POST
router.post('/:datasetId', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Invoke action in sync for specific dataset
  sync.invoke(req.params.datasetId, req.body, function(err: any, result: any) {
    if (err) {
      next(err)
    } else {
      res.json(result)
    }
  })
})

export default router
