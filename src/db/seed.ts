import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, external_saved, saved_events, sign_ups, users } from './schema';
//import userData from '../db/data/testData/users-test.json';
//import eventData from '../db/data/testData/events-test.json';
//import signupData from '../db/data/testData/signups-test.json';
//import savedData from '../db/data/testData/saved-test.json';

type User = {
	name: string;
	email: string;
	admin: boolean;
	user_id: string;
};

type Event = {
	event_name: string;
	event_date: string;
	start_time: string;
	end_time?: string | undefined;
	description: string;
	organiser_id: string;
	signup_limit?: number;
	event_id: number;
	postcode: string;
	firstline_address: string;
	price: string;
};

type Signup = {
	user_id: string;
	event_id: number;
};

type External = {
	user_id: string;
	event_id: string;
};

type SeedData = {
	users: User[];
	events: Event[];
	signups: Signup[];
	saved: Signup[];
	external: External[];
};

config({
	path: '.dev.vars',
});

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql);

async function seed(data: SeedData) {
	await db.delete(saved_events);
	await db.delete(sign_ups);
	await db.delete(events);
	await db.delete(external_saved);
	await db.delete(users);
	await db.insert(users).values(data.users);
	await db.insert(external_saved).values(data.external);
	await db.insert(events).values(data.events);
	await db.insert(sign_ups).values(data.signups);
	await db.insert(saved_events).values(data.saved);
}

//seed({ users: userData, saved: savedData, events: eventData, signups: signupData });

export default seed;
