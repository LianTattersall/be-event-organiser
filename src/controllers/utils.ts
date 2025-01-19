import { Context } from "hono"
import { Env } from "../index"

export const connectionStr = (c:Context<{Bindings: Env}>) => {
    return c.env ? c.env.DATABASE_URL : process.env.DATABASE_URL
}