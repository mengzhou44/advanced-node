const puppeteer = require('puppeteer');


const createSession = require('../factories/session-factory');
const createUser = require('../factories/user-factory');

class CustomPage {

    static async build() {
        const browser = await puppeteer.launch({
            headless: false

        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async getContent(selector) {
        return await this.page.$eval(selector, el => el.innerHTML);
    }

    async login() {
        const user = await createUser();
        const { session, sig } = createSession(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async get(path) {
        return await this.page.evaluate((path) => {
            return fetch(path, {
                method: 'GET',
                credentials: 'same-origin'
            }).then(res => res.json())
        }, path);
    }

    async post(path, data) {
        return await this.page.evaluate((path, data) => {
            return fetch(path, {
                method: 'POST',
                credentials: 'same-origin',
                'Content-Type': 'application/json',
                body: JSON.stringify(data)
            }).then(res => res.json())

        }, path, data);
    }

    execRequests(actions) {
        return Promise.all(
            actions.map(({ method, path, data }) => {
                return this[method](path, data);
            })
        );
    }

}


module.exports = CustomPage;