
const Page = require('./helpers/page');

let page;


beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('when not loggeed in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ];


    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);

        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    });

});

describe('when logged in', async () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a[href="/blogs/new"]');
        await page.waitFor('form label');
        await page.waitFor('form button');
    });

    test('when logged in, we can see blog create form.', async () => {

        let labelText = await page.getContent('form label');
        expect(labelText).toEqual('Blog Title');

    });

    describe('when logged in, and with valid input', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');

            await page.click('form button');
        });

        test('show take user to review screen', async () => {
            const temp = await page.getContent('form h5');
            expect(temp).toEqual('Please confirm your entries');
        });

        test('submitting then saving ads to take to index page.', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContent('.card-title');
            const content = await page.getContent('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });

    });


    test('when logged in, and with invalid input, form shows error message', async () => {

        await page.click('form button');

        const error1 = await page.getContent('.title .red-text');
        const error2 = await page.getContent('.content .red-text');

        expect(error1).toEqual('You must provide a value');
        expect(error2).toEqual('You must provide a value');

    });

});


