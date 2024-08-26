import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { chatRoutes } from './routes/chat'

const app = new Hono()

const apiRoutes = app
  .basePath('/api')
  .route('/chat', chatRoutes)

export default app
export type ApiRoutes = typeof apiRoutes;
