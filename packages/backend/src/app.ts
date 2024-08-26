import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { chatRoutes } from './routes/chat'

const app = new Hono()

app.use(cors(
  {
    origin: '*',
    allowHeaders: ['*'],
    allowMethods: ['*'],
  }
))


const apiRoutes = app
  .basePath('/api')
  .route('/chat', chatRoutes)

export default app
export type ApiRoutes = typeof apiRoutes;
