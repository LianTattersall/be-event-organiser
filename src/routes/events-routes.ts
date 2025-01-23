import { Hono } from 'hono';
import { Env } from '../index';
import { deleteEventById, getEventById, getEvents, postEvent } from '../controllers/events-controllers';

const events_routes = new Hono<{ Bindings: Env }>();

events_routes.get('/', getEvents);

events_routes.get('/:event_id', getEventById);

events_routes.delete('/:event_id', deleteEventById);

events_routes.post('/', postEvent);

export default events_routes;
