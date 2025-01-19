import app from "../src/index"
import endpoints from "../src/endpoints.json"
import { config } from "dotenv"
import seed from '../src/db/seed'
import userData from '../src/db/data/testData/users-test.json'
import eventData from '../src/db/data/testData/events-test.json'
import signupData from '../src/db/data/testData/signups-test.json'
import savedData from '../src/db/data/testData/saved-test.json'

beforeAll(() => {
    config({
        path: '.dev.vars'
    })
})

beforeEach(async () => {
    await seed({users:userData , events:eventData , signups:signupData, saved:savedData})
})

describe('/' , () => {
    describe("GET" , () => {
        test('200 - returns a object containing endpoint information' , async () => {
            const response = await app.request("/")
            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.endpoints).toEqual(endpoints)
            
        })
    })
})

describe('/users/:user_id' , () => {
    describe.only('GET' , () => {
        test('200 - responds with user object containing user id name email and admin status' , async () => {
            const response = await app.request('/users/1')
            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.user).toEqual({
                    name: expect.any(String),
                    user_id: expect.any(Number), 
                    email: expect.any(String),
                    admin: expect.any(Boolean)
                })
        })
        test('404 - responds with an error when the user does not exist' ,async () => {
            const response = await app.request('/users/200')
            expect(response.status).toBe(404)
            const data = await response.json()
            expect(data.message).toBe('404 - User not found')
        })
    })
})