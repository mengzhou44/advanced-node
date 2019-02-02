
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});


test('Header has correct logo text!', async () => {
    const logoText = await page.getContent('a.brand-logo');
    expect(logoText).toEqual('Blogster');
});


test('click login start oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});


test('when signed in, shows the logout button', async () => {
    await page.login();

    const text = await await page.getContent('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');

});