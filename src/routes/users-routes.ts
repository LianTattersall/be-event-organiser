import { Hono } from 'hono';
import { Env } from '../index';
import {
	deleteSaved,
	deleteSignup,
	deleteUserById,
	getSavedByUserId,
	getSignupsByUserId,
	getUserById,
	postSavedByUserId,
	postSignupByUserId,
	postUser,
} from '../controllers/users-controllers';

const users_routes = new Hono<{ Bindings: Env }>();

users_routes.get('/:user_id', getUserById);

users_routes.post('/', postUser);

users_routes.delete('/:user_id', deleteUserById);

users_routes.get('/:user_id/signups', getSignupsByUserId);

users_routes.post('/:user_id/signups', postSignupByUserId);

users_routes.delete('/:user_id/signups/:event_id', deleteSignup);

users_routes.get('/:user_id/saved', getSavedByUserId);

users_routes.post('/:user_id/saved', postSavedByUserId);

users_routes.delete('/:user_id/saved/:event_id', deleteSaved);

export default users_routes;
