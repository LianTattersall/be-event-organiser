import { Hono } from 'hono';
import { Env } from '../index';
import { getUserById, postUser } from '../controllers/users-controllers';

const users_routes = new Hono<{ Bindings: Env }>();

users_routes.get('/:user_id', getUserById);

users_routes.post('/', postUser);

export default users_routes;
