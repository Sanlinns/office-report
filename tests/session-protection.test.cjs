/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness loads transpiled server entry points. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { NextResponse } = require('next/server');

// Execute the actual TypeScript entry points with an isolated auth store and DB spies.
function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: (name) => name in mocks ? mocks[name] : require(name),
    console, Request, Response, Headers, URL, Date, process,
  }, { filename: file });
  return exports;
}

async function fixture() {
  const { betterAuth } = await import('better-auth');
  const { memoryAdapter } = await import('better-auth/adapters/memory');
  const db = { user: [], session: [], account: [], verification: [] };
  const auth = betterAuth({
    baseURL: 'http://localhost:3100', secret: 'isolated-test-secret-0123456789abcdef',
    database: memoryAdapter(db), emailAndPassword: { enabled: true },
    session: { expiresIn: 604800, updateAge: 86400, cookieCache: { enabled: true } },
  });
  const response = await auth.api.signUpEmail({
    body: { name: 'Test', email: 'session@example.test', password: 'test-password-123' }, asResponse: true,
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  let headers = new Headers();
  const redirect = (url) => { throw new Error('REDIRECT:' + url); };
  const session = load('lib/session.ts', {
    'server-only': {}, '@/lib/auth': { auth }, 'next/headers': { headers: async () => headers },
    'next/navigation': { redirect }, 'next/server': { NextResponse },
  });
  return { db, cookie, session, redirect, setCookie: (value) => { headers = new Headers({ cookie: value }); } };
}

const routes = {
  chats: ['GET', 'POST'], 'chats/[chatId]': ['DELETE'],
  'chats/[chatId]/messages': ['GET'], 'chats/[chatId]/send': ['POST'],
  incomes: ['GET', 'POST'], outcomes: ['GET', 'POST'], outcome: ['GET', 'POST'],
  remittances: ['GET', 'POST'], 'remittances/[id]': ['PATCH', 'DELETE'],
  'analytics/daily': ['GET'], daily: ['GET'], 'daily/[id]': ['PATCH', 'DELETE'],
  'ai/ask': ['POST'], 'ai/parse-income': ['POST'], 'ai/parse-outcome': ['POST'],
  'ai/predict': ['POST'], 'ai/next-steps': ['GET'], ask: ['POST'],
};

test('anonymous financial APIs return JSON 401 before any DB or request body work', async () => {
  const f = await fixture();
  for (const [path, methods] of Object.entries(routes)) {
    const mocks = new Proxy({ '@/lib/session': f.session, 'next/server': { NextResponse } }, {
      has: () => true,
      get(target, name) {
        if (name in target) return target[name];
        if (name === 'mongoose') return {};
        return new Proxy({}, { get: () => () => { throw new Error('Unexpected dependency call: ' + name); } });
      },
    });
    const route = load('app/api/' + path + '/route.ts', mocks);
    for (const method of methods) {
      const response = await route[method](new Request('http://localhost:3100/api/' + path), { params: Promise.resolve({ id: 'invalid' }) });
      assert.equal(response.status, 401, path + ' ' + method);
      assert.equal((await response.json()).error, 'Unauthorized');
    }
  }
});

test('expired and revoked sessions override still-valid cached cookies; sign-in has no redirect loop', async () => {
  for (const mode of ['expired', 'revoked']) {
    const f = await fixture();
    f.setCookie(f.cookie);
    assert.ok(await f.session.getSession());
    if (mode === 'expired') f.db.session[0].expiresAt = new Date(0);
    else f.db.session.length = 0;
    assert.equal(await f.session.getSession(), null);
    await assert.rejects(f.session.requireSession(), /REDIRECT:\/sign-in/);
    const page = load('app/(auth)/sign-in/page.tsx', {
      '@/lib/session': f.session, 'next/navigation': { redirect: f.redirect }, './sign-in-form': { default: () => null },
    });
    assert.ok(await page.default());
  }
});

test('valid session enters dashboard and redirects sign-in to dashboard', async () => {
  const f = await fixture(); f.setCookie(f.cookie);
  assert.equal((await f.session.requireSession()).user.email, 'session@example.test');
  assert.equal(await f.session.unauthorizedResponse(), null);
  const layout = load('app/dashboard/layout.tsx', {
    '@/lib/session': f.session, '@/components/ui/floating-dock': {}, '@/lib/dashboardNavItems': { dashboardNavItems: [] },
  });
  assert.ok(await layout.default({ children: 'dashboard' }));
  const page = load('app/(auth)/sign-in/page.tsx', {
    '@/lib/session': f.session, 'next/navigation': { redirect: f.redirect }, './sign-in-form': {},
  });
  await assert.rejects(page.default(), /REDIRECT:\/dashboard/);
});

test('income/outcome Server Actions reject anonymous calls before querying DB', async () => {
  const f = await fixture();
  for (const [file, names] of [
    ['incomeAction', ['createIncomeAction', 'deleteIncomeAction']],
    ['outcomeActions', ['createOutcomeAction', 'deleteOutcomeAction', 'fetchOutcomes']],
  ]) {
    const mocks = new Proxy({ '@/lib/session': f.session }, { has: () => true, get: (o, k) => o[k] ?? {} });
    const actions = load('lib/actions/' + file + '.ts', mocks);
    for (const name of names) await assert.rejects(actions[name]({}, new FormData()), /REDIRECT:\/sign-in/);
  }
});

test('valid sessions can read and create incomes after the auth check', async () => {
  const f = await fixture(); f.setCookie(f.cookie);
  const calls = [];
  const chain = { sort() { return this; }, skip() { return this; }, limit: async () => [{ amount: 100 }] };
  const route = load('app/api/incomes/route.ts', {
    '@/lib/session': f.session, 'next/server': { NextResponse }, mongoose: {},
    '@/lib/mongoDB/mongoDB': { connectToDB: async () => calls.push('connect') },
    '@/lib/mongoDB/models/income': {
      find: () => { calls.push('find'); return chain; }, countDocuments: async () => 1,
      create: async (doc) => { calls.push('create'); return doc; },
    },
  });
  const read = await route.GET(new Request('http://localhost:3100/api/incomes'));
  assert.equal(read.status, 200);
  assert.equal((await read.json()).incomes[0].amount, 100);
  const create = await route.POST(new Request('http://localhost:3100/api/incomes', {
    method: 'POST', body: JSON.stringify({ amount: 200, month: '2026-11', compamy: 'Test' }),
  }));
  assert.equal(create.status, 201);
  assert.equal((await create.json()).income.amount, 200);
  assert.deepEqual(calls, ['connect', 'find', 'connect', 'create']);
});

test('production password reset never logs reset URLs and reports the missing provider', async () => {
  let options;
  const authModule = load('lib/auth.ts', {
    'better-auth': { betterAuth: (value) => { options = value; return {}; } },
    mongodb: { MongoClient: class { db() { return {}; } } },
    'better-auth/adapters/mongodb': { mongodbAdapter: () => ({}) },
    'better-auth/next-js': { nextCookies: () => ({}) },
  });
  assert.ok(authModule.auth);
  assert.equal(options.session.expiresIn, 604800);
  assert.equal(options.session.updateAge, 86400);
  const previous = process.env.NODE_ENV;
  const log = console.log;
  const logged = [];
  try {
    process.env.NODE_ENV = 'production';
    console.log = (...args) => logged.push(args);
    await assert.rejects(options.emailAndPassword.sendResetPassword({
      user: { email: 'session@example.test' }, url: 'https://example.test/reset?token=private-test-token',
    }), /email provider is not configured/);
    assert.equal(logged.length, 0);
  } finally {
    console.log = log;
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
