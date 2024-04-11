import {Router} from 'express'
import controller from '../controllers/users.js'

const router  = Router()

router.post('/', controller.create)

export default router