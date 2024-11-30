import { Router } from 'express'
import {
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateUserBody } from '../middlewares/validations'
import sanitizeBody from '../middlewares/sanitizations'
import { Role } from '../models/user'

const customerRouter = Router()

customerRouter.get('/', getCustomers)
customerRouter.get('/:id', getCustomerById)
customerRouter.patch('/:id', validateUserBody, sanitizeBody(), updateCustomer)
customerRouter.delete('/:id', validateUserBody, sanitizeBody(), deleteCustomer)

export default customerRouter
