import { Hono } from 'hono';
import { Env } from '../index';
import { deleteExternalSaved, getExternalSavedEvents, postExternalSaved } from '../controllers/external-controllers';

const external_routes = new Hono<{ Bindings: Env }>();

external_routes.get('/:user_id', getExternalSavedEvents);

external_routes.post('/:user_id', postExternalSaved);

external_routes.delete('/:user_id/:event_id', deleteExternalSaved);

export default external_routes;
