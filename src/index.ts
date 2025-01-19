import { Hono } from "hono";
import endpoints from "./endpoints.json"
import users_routes from "./routes/users-routes";

export type Env = {
	DATABASE_URL: string
}

const app = new Hono<{Bindings:Env}>()

app.get('/' , (c) => {
	return c.json({endpoints} ,200)
})

app.route('/users' , users_routes)

export default app