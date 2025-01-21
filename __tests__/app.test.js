import app from '../src/index';
import endpoints from '../src/endpoints.json';
import { config } from 'dotenv';
import seed from '../src/db/seed';
import userData from '../src/db/data/testData/users-test.json';
import eventData from '../src/db/data/testData/events-test.json';
import signupData from '../src/db/data/testData/signups-test.json';
import savedData from '../src/db/data/testData/saved-test.json';

beforeAll(() => {
	config({
		path: '.dev.vars',
	});
});

beforeEach(async () => {
	await seed({ users: userData, events: eventData, signups: signupData, saved: savedData });
});

describe('/', () => {
	describe('GET', () => {
		test('200 - returns a object containing endpoint information', async () => {
			const response = await app.request('/');
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.endpoints).toEqual(endpoints);
		});
	});
});

describe('/users/:user_id', () => {
	describe('GET', () => {
		test('200 - responds with user object containing user id name email and admin status', async () => {
			const response = await app.request('/users/1');
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.user).toEqual({
				name: expect.any(String),
				user_id: expect.any(Number),
				email: expect.any(String),
				admin: expect.any(Boolean),
			});
		});
		test('404 - responds with an error when the user does not exist', async () => {
			const response = await app.request('/users/200');
			expect(response.status).toBe(404);
			const data = await response.json();
			expect(data.message).toBe('404 - User not found');
		});
	});
});

describe('/users', () => {
	describe('POST', () => {
		test('201 - responds with the user that was posted', async () => {
			const postInfo = { name: 'Toffee', email: 'toffee@gmail.com', admin: false };
			const response = await app.request('/users', {
				method: 'POST',
				body: JSON.stringify(postInfo),
			});
			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.user).toEqual(postInfo);
		});
		test('400 - responds with an error when the types are incorrect', async () => {
			const postInfo = { name: 4, email: '4@gmail.com', admin: 'false' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
		test('403 - responds with an error when a user with the same email already exists', async () => {
			const postInfo = { name: 'Lian2', email: 'lian@gmail.com', admin: false };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(403);
			const data = await response.json();
			expect(data.message).toBe('403 - Resource already exists');
		});
		test('400 - responds with an error when fields are missing', async () => {
			const postInfo = { email: 'unknown@gmail.com' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
		test('201 - Ignores extra fields on request body', async () => {
			const postInfo = { name: 'Toffee', email: 'toffee@gmail.com', admin: false, age: 17 };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.user).toEqual({ name: 'Toffee', email: 'toffee@gmail.com', admin: false });
		});
	});
});
