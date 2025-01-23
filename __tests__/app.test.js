import app from '../src/index';
import endpoints from '../src/endpoints.json';
import { config } from 'dotenv';
import seed from '../src/db/seed';
import userData from '../src/db/data/testData/users-test.json';
import eventData from '../src/db/data/testData/events-test.json';
import signupData from '../src/db/data/testData/signups-test.json';
import savedData from '../src/db/data/testData/saved-test.json';

/*beforeAll(() => {
	config({
		path: '.dev.vars',
	});
});*/

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
	describe('DELETE', () => {
		test('204 - Empty response body upon successful deletion', async () => {
			const response = await app.request('/users/2', { method: 'DELETE' });
			expect(response.status).toBe(204);
			const data = response.body;
			expect(data).toBe(null);
		});
		test('404 - Responds with an error when the user does not exist', async () => {
			const response = await app.request('/users/2004005', { method: 'DELETE' });
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

describe('/events', () => {
	describe('GET', () => {
		test('200 - responds with an array of event objects with default limit 10 and default page 1', async () => {
			const response = await app.request('/events');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(10);
			expect(data.events[0].event_id).toBe(1);

			data.events.forEach((event, index) => {
				expect(event).toEqual({
					event_id: index + 1,
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					signups: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('200 - limit query determines the number of events returned and page query determines which page', async () => {
			const response = await app.request('/events?limit=5&p=2');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(5);
			expect(data.events[0].event_id).toBe(6);

			data.events.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					signups: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('400 - responds with error when limit and p are not numbers', async () => {
			const response = await app.request('/events?limit=hi');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type for query');
		});
		test('200 - can sort by date', async () => {
			const response = await app.request('/events?sortby=date&orderby=desc');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(10);
			const timeStamps = data.events.map((event) => new Date(event.event_date).getTime());
			expect(timeStamps).toBeSorted({ descending: true });
		});
		test('200 - can sort by price', async () => {
			const response = await app.request('/events?sortby=price');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(10);
			const prices = data.events.map((event) => Number(event.price));
			expect(prices).toBeSorted();
		});
		test('400 - responds with an error when order by is not asc or desc', async () => {
			const response = await app.request('/events?sortby=date&orderby=hello');
			expect(response.status).toBe(400);

			const data = await response.json();

			expect(data.message).toBe('400 - Invalid query for orderby');
		});
		test('400 - responds with an error when sortby query is invalid', async () => {
			const response = await app.request('/events?sortby=hello&orderby=desc');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid query for sortby');
		});
		test('200 - type query filters available events', async () => {
			const response = await app.request('/events?type=current');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBeGreaterThan(0);
			data.events.forEach((event) => {
				expect(new Date(event.event_date).getTime()).toBeGreaterThan(new Date().getTime());
				expect(event.signup_limit).toBeGreaterThan(event.signups);
			});
		});
		test('400 - responds with an error when type query is invalid', async () => {
			const response = await app.request('/events?type=past');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid query for type');
		});
		test('200 - searchTerm query filters results', async () => {
			const response = await app.request('/events?searchTerm=picnic+park');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events[0]).toEqual({
				price: '12.20',
				event_id: 2,
				event_name: 'Picnic in Hyde Park',
				event_date: '2025-07-01',
				start_time: '12:00:00',
				end_time: '18:00:00',
				signup_limit: 10,
				signups: 5,
				image_URL: 'https://media.timeout.com/images/106207035/750/422/image.jpg',
			});
		});
		test('200 - can apply multiple queries', async () => {
			const response = await app.request('/events?searchTerm=secret+santa&type=current&sortby=date&orderby=desc');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.events.length).toBeGreaterThan(0);
			data.events.forEach((event) => {
				expect(event.event_name).toBe('Secret Santa Exchange');
				expect(new Date(event.event_date).getTime()).toBeGreaterThan(new Date().getTime());
				expect(event.signup_limit).toBeGreaterThan(event.signups);
			});
		});
	});
	describe('POST', () => {
		test('201 - Responds with the event that has successfully been added to the db', async () => {
			const postInfo = {
				event_name: 'Trip to Science Museum',
				event_date: '2025-04-23',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};
			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.event).toEqual({ ...postInfo, event_id: expect.any(Number) });
		});
		test('400 - responds with an error when date is in incorrect format', async () => {
			const postInfo = {
				event_name: 'Science Museum Visit',
				event_date: '2',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};
			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid syntax for date/time');
		});
		test('400 - responds with an error when the time is in the incorrect format', async () => {
			const postInfo = {
				event_name: 'Science Museum Visit',
				event_date: '2023-09-2',
				start_time: '09:0',
				end_time: '1hi0',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};
			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid syntax for date/time');
		});
		test('400 - responds with an error when there are missing fields that are required', async () => {
			const postInfo = {
				end_time: '01:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};
			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Missing information on request body');
		});
		test('400 - responds with an error for invalid data types', async () => {
			const postInfo = {
				event_name: 'Trip to Science Museum',
				event_date: '2025-04-23',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 'thirty',
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};

			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
		test('201 - Ignores any extra fields on the requestb body', async () => {
			const postInfo = {
				event_name: 'Trip to Science Museum',
				event_date: '2025-04-23',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
				reviews: ['5 stars'],
			};

			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.event).toEqual({
				event_name: 'Trip to Science Museum',
				event_date: '2025-04-23',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '0.00',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
				event_id: expect.any(Number),
			});
		});
		test('400 - responds with error when price has incorrect format', async () => {
			const postInfo = {
				event_name: 'Trip to Science Museum',
				event_date: '2025-04-23',
				start_time: '09:00:00',
				end_time: '14:00:00',
				price: '6666.66666666hj',
				image_URL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX7w2mn_cGck-it4SGUHPokp66b2yTB58DGQ&s',
				signup_limit: 30,
				description: "Visit one of London's most exciting museums.",
				organiser_id: 2,
			};

			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
	});
});

describe('/events/:event_id', () => {
	describe('GET', () => {
		test('200 - responds with all the information of the event with the corresponding event_id', async () => {
			const response = await app.request('/events/1');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.event).toEqual({
				price: '10.00',
				event_id: 1,
				event_name: 'London Marathon',
				event_date: '2025-04-01',
				start_time: '10:00:00',
				end_time: '18:00:00',
				description: '26.2 miles of London',
				organiser_id: 1,
				signup_limit: 3000,
				image_URL: 'https://www.londontravelwatch.org.uk/wp-content/uploads/2023/04/London-Marathon-cropped.png',
				signups: 2,
				organiser_name: 'Lian',
				organiser_email: 'lian@gmail.com',
			});
		});
		test('404 - responds with an error when the event does not exist', async () => {
			const response = await app.request('/events/23456700');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Event not found');
		});
	});
	describe('DELETE', () => {
		test('204 - no response upon successful deletion of event', async () => {
			const response = await app.request('/events/3', { method: 'DELETE' });
			expect(response.status).toBe(204);

			const data = response.body;
			expect(data).toBe(null);
		});
		test('404 - responds with an error when the event does not exist', async () => {
			const response = await app.request('/events/3333333', { method: 'DELETE' });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Event not found');
		});
	});
});
