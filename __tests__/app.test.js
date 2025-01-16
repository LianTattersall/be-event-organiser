import app from "../src/index"

describe('/' , () => {
    describe("GET" , () => {
        test('200 - returns a object containing endpoint information' , async () => {
            const response = await app.request("/")
            const data = await response.json()
            expect(data).toEqual({endpoints: {}})
            
        })
    })
})