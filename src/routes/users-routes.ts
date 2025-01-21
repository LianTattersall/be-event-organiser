import { Hono } from 'hono';
import { Env } from '../index';
import { deleteUserById, getUserById, postUser } from '../controllers/users-controllers';

const users_routes = new Hono<{ Bindings: Env }>();

users_routes.get('/:user_id', getUserById);

users_routes.post('/', postUser);

users_routes.delete('/:user_id', deleteUserById);

export default users_routes;
