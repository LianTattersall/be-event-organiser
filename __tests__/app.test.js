import app from '../src/index';
import endpoints from '../src/endpoints.json';
import { toBeOneOf } from 'jest-extended';
import seed from '../src/db/seed';
import userData from '../src/db/data/testData/users-test.json';
import eventData from '../src/db/data/testData/events-test.json';
import signupData from '../src/db/data/testData/signups-test.json';
import savedData from '../src/db/data/testData/saved-test.json';
import externalData from '../src/db/data/testData/external-test.json';

/*beforeAll(() => {
	config({
		path: '.dev.vars',
	});
});*/

beforeEach(async () => {
	await seed({ users: userData, events: eventData, signups: signupData, saved: savedData, external: externalData });
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
				user_id: expect.any(String),
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
			const postInfo = { name: 'Toffee', email: 'toffee@gmail.com', admin: false, user_id: '234GHT' };
			const response = await app.request('/users', {
				method: 'POST',
				body: JSON.stringify(postInfo),
			});
			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.user).toEqual(postInfo);
		});
		test('400 - responds with an error when the types are incorrect', async () => {
			const postInfo = { name: 4, email: '4@gmail.com', admin: 'false', user_id: '@£HGTY' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
		test('403 - responds with an error when a user with the same email already exists', async () => {
			const postInfo = { name: 'Lian2', email: 'lian@gmail.com', admin: false, user_id: '34grii' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(403);
			const data = await response.json();
			expect(data.message).toBe('403 - Resource already exists');
		});
		test('400 - responds with an error when fields are missing', async () => {
			const postInfo = { email: 'unknown@gmail.com', admin: false, name: 'ghost' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type on request body');
		});
		test('201 - Ignores extra fields on request body', async () => {
			const postInfo = { name: 'Toffee', email: 'toffee@gmail.com', admin: false, age: 17, user_id: '234' };
			const response = await app.request('/users', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.user).toEqual({ name: 'Toffee', email: 'toffee@gmail.com', admin: false, user_id: '234' });
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
					signup_limit: expect.toBeOneOf([expect.any(Number), null]),
					signups: expect.any(Number),
					price: expect.any(String),
					firstline_address: expect.any(String),
					image_description: expect.any(String),
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
					signup_limit: expect.toBeOneOf([expect.any(Number), null]),
					signups: expect.any(Number),
					price: expect.any(String),
					firstline_address: expect.any(String),
					image_description: expect.any(String),
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
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				image_description: expect.any(String),
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
				organiser_id: '2',
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
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
				organiser_id: '2',
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
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
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
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
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
			};

			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type');
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
				organiser_id: '2',
				reviews: ['5 stars'],
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
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
				organiser_id: '2',
				event_id: expect.any(Number),
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: 'A picture of a mathematical sculpture with spectators observing',
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
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
			};

			const response = await app.request('/events', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type');
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
				organiser_id: '1',
				signup_limit: 3000,
				image_URL: 'https://www.londontravelwatch.org.uk/wp-content/uploads/2023/04/London-Marathon-cropped.png',
				signups: 2,
				organiser_name: 'Lian',
				organiser_email: 'lian@gmail.com',
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: expect.any(String),
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
	describe('PATCH', () => {
		test('200 - responds with the updated event upon a successful patch', async () => {
			const patchInfo = {
				price: '30.00',
				event_name: 'Richmond Marathon',
				event_date: '2025-10-13',
				start_time: '09:00:00',
				end_time: '16:00:00',
				description: 'Run around kew gardens and richmond',
				signup_limit: 600,
				image_URL: 'https://run-fest.com/wp-content/uploads/2022/08/3-1.jpg',
				firstline_address: 'Kew Gardens',
				postcode: 'WF45 8ET',
				image_description: 'people running in the background with a triangular medal over it',
			};
			const response = await app.request('/events/1', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.event).toEqual({
				event_id: 1,
				organiser_id: '1',
				price: '30.00',
				event_name: 'Richmond Marathon',
				event_date: '2025-10-13',
				start_time: '09:00:00',
				end_time: '16:00:00',
				description: 'Run around kew gardens and richmond',
				signup_limit: 600,
				image_URL: 'https://run-fest.com/wp-content/uploads/2022/08/3-1.jpg',
				firstline_address: 'Kew Gardens',
				postcode: 'WF45 8ET',
				image_description: 'people running in the background with a triangular medal over it',
			});
		});
		test('200 - can patch with any number of fields', async () => {
			const patchInfo = { event_name: 'Picnic in Brockwell Park' };
			const response = await app.request('/events/2', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.event).toEqual({
				price: '12.20',
				event_id: 2,
				event_name: 'Picnic in Brockwell Park',
				event_date: '2025-07-01',
				start_time: '12:00:00',
				end_time: '18:00:00',
				description: 'Food in alovely park',
				organiser_id: '2',
				signup_limit: 10,
				image_URL: 'https://media.timeout.com/images/106207035/750/422/image.jpg',
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: expect.any(String),
			});
		});
		test('200 - Ignores any additional fields', async () => {
			const patchInfo = { event_name: 'Picnic in Brockwell Park', reviews: '5 Stars' };
			const response = await app.request('/events/2', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.event).toEqual({
				price: '12.20',
				event_id: 2,
				event_name: 'Picnic in Brockwell Park',
				event_date: '2025-07-01',
				start_time: '12:00:00',
				end_time: '18:00:00',
				description: 'Food in alovely park',
				organiser_id: '2',
				signup_limit: 10,
				image_URL: 'https://media.timeout.com/images/106207035/750/422/image.jpg',
				firstline_address: 'Hyde Park, Serpentine Rd, London',
				postcode: 'W2 2UH',
				image_description: expect.any(String),
			});
		});
		test('400 - responds with an error for any incorrect data types (price)', async () => {
			const patchInfo = { price: 'hello' };
			const response = await app.request('/events/3', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type');
		});
		test('400 - responds with an error for any incorrect data types (date/time)', async () => {
			const patchInfo = { event_date: '23' };
			const response = await app.request('/events/3', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid syntax for date/time');
		});
		test('400 - responds with an error when there are not valid columns', async () => {
			const patchInfo = { unknownField: 'Event' };
			const response = await app.request('/events/6', { method: 'PATCH', body: JSON.stringify(patchInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - No information on request body');
		});
		test('404 - responds with an error when the event does not exist', async () => {
			const patchInfo = { event_name: 'Roller skating' };
			const response = await app.request('/events/23499', { method: 'PATCH', body: JSON.stringify(patchInfo) });

			const data = await response.json();

			expect(data.message).toBe('404 - Event not found');
		});
	});
});

describe('/events/:event_id/users', () => {
	describe('GET', () => {
		test('200 - responds with the users that have signed up to this event', async () => {
			const response = await app.request('/events/1/users');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.users.length).toBe(2);
			data.users.forEach((user) => {
				expect(user).toEqual({
					name: expect.any(String),
					email: expect.any(String),
				});
			});
		});
		test('200 - responds with an empty array when there are no signups', async () => {
			const response = await app.request('/events/7/users');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.users.length).toBe(0);
		});
		test('400 - responds with an error when the event does not exist', async () => {
			const response = await app.request('/events/704040404/users');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Event not found');
		});
		test('200 - Can include a search term', async () => {
			const response = await app.request('/events/1/users?searchTerm=Hanna');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.users.length).toBe(1);
			expect(data.users[0]).toEqual({ name: 'Hanna', email: 'Hanna@gmail.com' });
		});
		test('200 - can add p and limit queries', async () => {
			const response = await app.request('/events/2/users?limit=2&p=2');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.users.length).toBe(2);
		});
		test('400 - responds with an error when limit or p are not numbers', async () => {
			const response = await app.request('/events/2/users?limit=hello&p=2');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type for query');
		});
	});
});

describe('/users/:user_id/saved', () => {
	describe('GET', () => {
		test('200 - responds with the events that the specified user has signed up to', async () => {
			const response = await app.request('/users/2/saved');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.saved.length).toBe(2);
			data.saved.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('200 - can add p  and limit queries', async () => {
			const response = await app.request('/users/2/saved?limit=1&p=2');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.saved.length).toBe(1);
			data.saved.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('400 - responds with an error when the p or limit queries are invalid', async () => {
			const response = await app.request('/users/2/saved?limit=hello&p=2');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type for query');
		});
		test('404 - responds with an error when the user does not exist', async () => {
			const response = await app.request('/users/2000000/saved?limit=2&p=2');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - User not found');
		});
		test('200 responds with an empty array if the user does not have any signups', async () => {
			const response = await app.request('/users/6/saved');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.saved.length).toBe(0);
		});
		test('200 - query type=curr filters signups for upcoming events', async () => {
			const response = await app.request('/users/2/saved?type=curr');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.saved.length).toBe(1);
			expect(data.saved[0]).toEqual({
				price: '12.20',
				event_id: 2,
				event_name: 'Picnic in Hyde Park',
				event_date: '2025-07-01',
				start_time: '12:00:00',
				end_time: '18:00:00',
				signup_limit: 10,
				image_URL: 'https://media.timeout.com/images/106207035/750/422/image.jpg',
			});
		});
		test('200 - query type=past filters signups for past events', async () => {
			const response = await app.request('/users/2/saved?type=past');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.saved.length).toBe(1);
			expect(data.saved[0]).toEqual({
				price: '10.00',
				event_id: 5,
				event_name: 'Secret Santa Exchange',
				event_date: '2024-12-15',
				start_time: '15:00:00',
				end_time: '20:00:00',
				signup_limit: 30,
				image_URL: 'https://assets.editorial.aetnd.com/uploads/2009/10/christmas-gettyimages-184652817.jpg',
			});
		});
		test('400 - responds with an error when the type filter is invalid', async () => {
			const response = await app.request('/users/6/saved?type=hello');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid query for type');
		});
	});
	describe('POST', () => {
		test('201 - responds with the succesfully posted event_id and user_id', async () => {
			const postInfo = { event_id: 3 };
			const response = await app.request('/users/6/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.saved).toEqual({ user_id: '6', event_id: 3 });
		});
		test('400 - responds with an error when id is incorrect data type', async () => {
			const postInfo = { event_id: 'hello' };
			const response = await app.request('/users/6/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type');
		});
		test('404 - responds with an error when user_id does not exist', async () => {
			const postInfo = { event_id: 3 };
			const response = await app.request('/users/6909090/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
		test('404 - responds with an error when event_id does not exist', async () => {
			const postInfo = { event_id: 3000000 };
			const response = await app.request('/users/6/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
		test('403 - responds with an error when the user has already saved the same event', async () => {
			const postInfo = { event_id: 5 };
			const response = await app.request('/users/2/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(403);

			const data = await response.json();
			expect(data.message).toBe('403 - Resource already exists');
		});
		test('400 - responds with an error when event id not provided', async () => {
			const postInfo = {};
			const response = await app.request('/users/2/saved', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Missing information on request body');
		});
	});
});

describe('/users/:user_id/saved/:event_id', () => {
	describe('DELETE', () => {
		test('204 - responds with empty body upon successful deletion', async () => {
			const response = await app.request('/users/1/saved/3', { method: 'DELETE' });
			expect(response.status).toBe(204);

			const data = response.body;
			expect(data).toBe(null);
		});
		test('404 - responds with error when saved event does not exist', async () => {
			const response = await app.request('/users/6/saved/12', { method: 'DELETE' });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
	});
});

describe('/users/:user_id/signups', () => {
	describe('GET', () => {
		test('200 - responds with the events that the specified user has signed up to', async () => {
			const response = await app.request('/users/2/signups');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.signups.length).toBe(4);
			data.signups.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('200 - can add p  and limit queries', async () => {
			const response = await app.request('/users/2/signups?limit=1&p=2');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.signups.length).toBe(1);
			data.signups.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					price: expect.any(String),
				});
			});
		});
		test('400 - responds with an error when the p or limit queries are invalid', async () => {
			const response = await app.request('/users/2/signups?limit=hello&p=2');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type for query');
		});
		test('404 - responds with an error when the user does not exist', async () => {
			const response = await app.request('/users/2000000/signups?limit=2&p=2');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - User not found');
		});
		test('200 responds with an empty array if the user does not have any signups', async () => {
			const response = await app.request('/users/6/signups');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.signups.length).toBe(0);
		});
		test('200 - query type=curr filters signups for upcoming events', async () => {
			const response = await app.request('/users/2/signups?type=curr');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.signups.length).toBe(3);
			data.signups.forEach((event) => {
				expect(event).toEqual({
					event_id: expect.any(Number),
					event_name: expect.any(String),
					event_date: expect.any(String),
					start_time: expect.any(String),
					end_time: expect.any(String),
					image_URL: expect.any(String),
					signup_limit: expect.any(Number),
					price: expect.any(String),
				});
				expect(new Date(event.event_date).getTime()).toBeGreaterThan(new Date().getTime());
			});
		});
		test('200 - query type=past filters signups for past events', async () => {
			const response = await app.request('/users/2/signups?type=past');
			expect(response.status).toBe(200);

			const data = await response.json();

			expect(data.signups.length).toBe(1);
			expect(data.signups[0]).toEqual({
				price: '10.90',
				event_id: 11,
				event_name: 'Secret Santa Exchange',
				event_date: '2024-12-15',
				start_time: '15:00:00',
				end_time: '20:00:00',
				signup_limit: 2,
				image_URL: 'https://assets.editorial.aetnd.com/uploads/2009/10/christmas-gettyimages-184652817.jpg',
			});
		});
		test('400 - responds with an error when the type filter is invalid', async () => {
			const response = await app.request('/users/6/signups?type=hello');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid query for type');
		});
	});
	describe('POST', () => {
		test('201 - responds with the succesfully posted event_id and user_id', async () => {
			const postInfo = { event_id: 8 };
			const response = await app.request('/users/6/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.signup).toEqual({ user_id: '6', event_id: 8 });
		});
		test('400 - responds with an error when id is incorrect data type', async () => {
			const postInfo = { event_id: 'hello' };
			const response = await app.request('/users/6/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type');
		});
		test('404 - responds with an error when user_id does not exist', async () => {
			const postInfo = { event_id: 8 };
			const response = await app.request('/users/6909090/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
		test('404 - responds with an error when event_id does not exist', async () => {
			const postInfo = { event_id: 3000000 };
			const response = await app.request('/users/6/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
		test('403 - responds with an error when the user has already saved the same event', async () => {
			const postInfo = { event_id: 2 };
			const response = await app.request('/users/3/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(403);

			const data = await response.json();
			expect(data.message).toBe('403 - Resource already exists');
		});
		test('400 - responds with an error when event id not provided', async () => {
			const postInfo = {};
			const response = await app.request('/users/2/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Missing information on request body');
		});
		test('422 - responds with an error when a user tries to signup up for an expired event', async () => {
			const postInfo = { event_id: 5 };
			const response = await app.request('/users/2/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(422);

			const data = await response.json();
			expect(data.message).toBe('422 - Event has expired');
		});
		test('409 - responds with an error when a user tries to signup up for an event which has reached its limit', async () => {
			const postInfo = { event_id: 3 };
			const response = await app.request('/users/6/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(409);

			const data = await response.json();
			expect(data.message).toBe("409 - Event has reached it's signup limit");
		});
		test('201 - can signup to an event with an unlimited signup limit', async () => {
			const postInfo = { event_id: 10 };
			const response = await app.request('/users/6/signups', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.signup).toEqual({ user_id: '6', event_id: 10 });
		});
	});
});

describe('/users/:user_id/signups/:event_id', () => {
	describe('DELETE', () => {
		test('204 - responds with empty body upon successful deletion', async () => {
			const response = await app.request('/users/1/signups/3', { method: 'DELETE' });
			expect(response.status).toBe(204);

			const data = response.body;
			expect(data).toBe(null);
		});
		test('404 - responds with error when saved event does not exist', async () => {
			const response = await app.request('/users/6/signups/12', { method: 'DELETE' });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Resource not found');
		});
	});
});

describe('/events/organiser/:orgnaniser_id', () => {
	describe('GET', () => {
		test('200 - responds with all the events organised by the user with the specified ID', async () => {
			const response = await app.request('/events/organiser/1');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(4);
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
		test('404 - responds with an error when the organiser_id does not exist', async () => {
			const response = await app.request('/events/organiser/12344444');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Organiser not found');
		});
		test('404 - responds with an error when the organiser_id does not exist', async () => {
			const response = await app.request('/events/organiser/3');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Organiser not found');
		});
		test('200 - Can have p and limit queries', async () => {
			const response = await app.request('/events/organiser/1?p=2&limit=1');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(1);
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
		test('400 - responds with an error when the p or limit are not numbers', async () => {
			const response = await app.request('/events/organiser/3?p=hello');
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Invalid data type for query');
		});
		test('200 - can add type=curr query which filter for future events', async () => {
			const response = await app.request('/events/organiser/1?type=curr');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(3);
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
		test('200 - can add type=past query which filter for past events', async () => {
			const response = await app.request('/events/organiser/1?type=past');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(1);
			expect(data.events[0]).toEqual({
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
});

describe('/externalEvents/:user_id', () => {
	describe('GET', () => {
		test('200 - responds with the saved event_ids that the user has', async () => {
			const response = await app.request('/externalEvents/1');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events.length).toBe(1);
			expect(data.events[0]).toEqual({ event_id: '1kuYvO3_GA1qo09' });
		});
		test('200 - responds with the saved event_ids that the user has (empty if there are none)', async () => {
			const response = await app.request('/externalEvents/5');
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.events).toEqual([]);
		});
		test('404 - responds with an error when the user does not exist', async () => {
			const response = await app.request('/externalEvents/500000');
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - User not found');
		});
	});
	describe('POST', () => {
		test('201 - responds with the successfully created entry', async () => {
			const postInfo = { event_id: '123dft56' };
			const response = await app.request('/externalEvents/1', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.saved).toEqual({ event_id: '123dft56', user_id: '1' });
		});
		test('400 - responds with an error when no event_id provided', async () => {
			const postInfo = { event: '123dft56' };
			const response = await app.request('/externalEvents/1', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(400);

			const data = await response.json();
			expect(data.message).toBe('400 - Missing information on request body');
		});
		test('404 - responds with an error when the user does not exist', async () => {
			const postInfo = { event: '123dft56' };
			const response = await app.request('/externalEvents/100000', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - User not found');
		});
		test('403 - responds with an error when the entry already exists', async () => {
			const postInfo = { event_id: '1kuYvO3_GA1qo09' };
			const response = await app.request('/externalEvents/1', { method: 'POST', body: JSON.stringify(postInfo) });
			expect(response.status).toBe(403);

			const data = await response.json();
			expect(data.message).toBe('403 - Resource already exists');
		});
	});
});

describe('/events/:user_id/:event_id', () => {
	describe('GET', () => {
		test('204 - empty response body upon successfull deletion', async () => {
			const response = await app.request('/externalEvents/1/1kuYvO3_GA1qo09', { method: 'DELETE' });
			expect(response.status).toBe(204);

			const data = response.body;
			expect(data).toBe(null);
		});
		test('404 - responds with an error when the entry cannot be found', async () => {
			const response = await app.request('/externalEvents/1/1kuY_GA1qo09', { method: 'DELETE' });
			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.message).toBe('404 - Saved event not found');
		});
	});
});
