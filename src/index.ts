import { Hono } from "hono";

export type Env = {
	DATABASE_URL: string
}

const app = new Hono<{Bindings:Env}>()

app.get('/' , (c) => {
	return c.json({"endpoints": {}})
})

export default app