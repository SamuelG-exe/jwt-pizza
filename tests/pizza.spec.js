import { test, expect } from 'playwright-test-coverage';


  test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});


  test('register', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const registerReq = {name: "regTest", email: 'register@jwt.com', password: 'a' };
    const registerRes = { user: { id: 3, name: 'regTest', email: 'register@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdefg' };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(registerReq);
    await route.fulfill({ json: registerRes });
  });
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByPlaceholder('Full name').click();
    await page.getByPlaceholder('Full name').fill('regTest');
    await page.getByPlaceholder('Full name').press('Tab');
    await page.getByPlaceholder('Email address').fill('register@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'r', exact: true }).click();
    await expect(page.getByRole('main')).toContainText('regTest');
    await expect(page.getByRole('main')).toContainText('register@jwt.com');
    await expect(page.getByRole('main')).toContainText('diner');

  });

  test('login', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'z@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'z@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('z@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  });

  test('logOut', async ({ page }) => {
    //Log in and out page routes
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'PUT') {
        const loginReq = { email: 'z@jwt.com', password: 'a' };
        const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'z@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
      } else if (route.request().method() === 'DELETE') {
        const logOutRes = { message: 'logout successful' };
        expect(route.request().headers()['authorization']).toBe('Bearer abcdef');
        await route.fulfill({ json: logOutRes });
      }
    });
  
  
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('z@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    
    //LogOut
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.locator('#navbar-dark')).toBeVisible();
    });

  test('purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.route('*/**/api/order', async (route) => {
      const orderReq = {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
      };
      const orderRes = {
        order: {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          id: 23,
        },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    });
  
    await page.goto('http://localhost:5173/');
  
    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();
  
    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();
  
    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();
  });

  test('Admin Login and page', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'MasterComander@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'MasterComander', email: 'MasterComander@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
  //login
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('MasterComander@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

  //Admin
    
    await expect(page.getByRole('link', { name: 'Admin', exact: true })).toBeVisible();await expect(page.getByRole('link', { name: 'Admin', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();

    });

  test('Admin add franchise and Delete', async ({ page }) => {
    let deleted = false;
      // Mock admin login
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'MasterComander@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'MasterComander', email: 'MasterComander@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });


  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'GET') {
      if(deleted){await route.fulfill({ json: []})}
      // GET(got)
      else{await route.fulfill({ json: [{ name: 'TheFran', admins: [{ email: 'franchisee@example.com', id: 8, name: 'Cortona' }], id: 5,  stores: [] }]})}
    } 
    else if (route.request().method() === 'POST') {
      // POST(malone)
      const franchiseReq = { name: 'TheFran', admins: [{ email: 'franchisee@example.com' }] };
      const franchiseRes = { 
        name: 'TheFran', 
        admins: [{email: 'franchisee@example.com', id: 8, name: 'Cortona'}],
        id: 5
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseRes });
    }
  });
  await page.route('*/**/api/franchise/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      const franchiseId = route.request().url().split('/').pop();
      expect(franchiseId).toBe('5'); 
      await route.fulfill({ status: 200, json: { message: 'franchise deleted' } });
    }
  });



  // login 
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('MasterComander@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  //  Admin page
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin' }).click();

  
  //Add fran
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill('TheFran');
  await page.getByPlaceholder('franchisee admin email').click();
  await page.getByPlaceholder('franchisee admin email').fill('franchisee@example.com');

  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.locator('tbody')).toContainText('TheFran');
  await expect(page.locator('tbody')).toContainText('Cortona');

  await page.getByRole('button', { name: 'Close' }).click();
  deleted = true
  await page.getByRole('button', { name: 'Close' }).click();
  });    

  test('User notfound admin page', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'z@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'z@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
  
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('z@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.goto('http://localhost:5173/admin-dashboard');
    await expect(page.getByRole('heading')).toContainText('Oops');
    });

  test('carousel-Home-page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.locator('.hs-carousel-active\\:bg-blue-700').first().click();
    await page.locator('.hs-carousel-pagination > span:nth-child(2)').click();
    await page.locator('span:nth-child(3)').click();
    await page.locator('span:nth-child(4)').click();
  
  });

  test('Franchise PhoneNumber', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('link', { name: '-555-5555' }).click();
  
  });

  test('footer navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'About' }).click();
    await page.getByRole('link', { name: 'History' }).click();
    await page.getByRole('link', { name: 'home' }).click();
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
  });



















    test('User admin add store page', async ({ page }) => {
    let deleted = false;
      // Mock admin login
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'franchisee@example.com', password: 'a' };
    const loginRes = { user: { id: 8, name: 'Cortona', email: 'franchisee@example.com', roles: [{ role: 'franchisee' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });


  await page.route('*/**/api/franchise/', async (route) => {
    if (route.request().method() === 'GET') {
      if(deleted){await route.fulfill({ json: []})}
      // GET(got)
      else{await route.fulfill({ json: [{ name: 'TheFran', admins: [{ email: 'franchisee@example.com', id: 8, name: 'Cortona' }], id: 5,  stores: [{ id: 4, name: 'SLC', totalRevenue: 2 }] }]})}
    } 
    else if (route.request().method() === 'POST') {
      // POST(malone)
      const franchiseReq = { name: 'TheFran', admins: [{ email: 'franchisee@example.com' }] };
      const franchiseRes = { 
        name: 'TheFran', 
        admins: [{email: 'franchisee@example.com', id: 8, name: 'Cortona'}],
        id: 5
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseRes });
    }
  });
  await page.route('*/**/api/franchise/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [{ name: 'TheFran', admins: [{ email: 'franchisee@example.com', id: 8, name: 'Cortona' }], id: 5,  stores: [{ id: 4, name: 'SLC', totalRevenue: 2 }] }]})}
    });



  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();

  // login
  await page.getByPlaceholder('Email address').fill('franchisee@example.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
await expect(page.getByRole('heading')).toContainText('TheFran');
await expect(page.locator('tbody')).toContainText('SLC');
await expect(page.locator('tbody')).toContainText('2 ₿');
await expect(page.getByLabel('Global').getByRole('link', { name: 'Franchise' })).toBeVisible();

await page.getByRole('button', { name: 'Create store' }).click();


  });    




  