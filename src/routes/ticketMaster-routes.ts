import { Hono } from 'hono';
import { Env } from '../index';
import { getTicketMaster } from '../controllers/ticketMaster-controller';

const ticketMaster_routes = new Hono<{ Bindings: Env }>();

ticketMaster_routes.get('/events.json', getTicketMaster);

ticketMaster_routes.get('/events/:event_id', getTicketMaster);

ticketMaster_routes.get('/classifications', getTicketMaster);

export default ticketMaster_routes;
