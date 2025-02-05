import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { config } from 'dotenv';

config({
	path: '.dev.vars',
});
const sql = neon(process.env.DATABASE_URL_TEST!);

const db = drizzle(sql);

const main = async () => {
	try {
		await migrate(db, {
			migrationsFolder: 'drizzle',
		});
		console.log('migration successful');
	} catch (error) {
		console.log('migration error');
		console.log(error);
	}
};

main();
