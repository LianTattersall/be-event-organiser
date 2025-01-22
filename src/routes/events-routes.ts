import { Hono } from 'hono';
import { Env } from '../index';
import { getEvents } from '../controllers/events-controllers';

const events_routes = new Hono<{ Bindings: Env }>();

events_routes.get('/', getEvents);

export default events_routes;
