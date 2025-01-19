import { Hono } from "hono";
import { Env } from "../index";
import { getUserById } from "../controllers/users-controllers";

const users_routes = new Hono<{Bindings:Env}>()

users_routes.get('/:user_id' , getUserById)

export default users_routes