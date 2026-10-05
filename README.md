# Playwright Live Practice

Playwright (TypeScript) tests against two public sites, so there is nothing to host.

| Project | Target | What it covers |
|---|---|---|
| `api` | https://restful-booker.herokuapp.com ([docs](https://restful-booker.herokuapp.com/apidoc/index.html)) | GET / POST / PUT / PATCH / DELETE, token and Basic auth, 403 / 404 cases, filters, full lifecycle |
| `ui` | https://demo.playwright.dev/todomvc | locators, add / edit / complete / delete, filters, reload persistence |

## Setup
```bash
npm install
npx playwright install
```

## Run
```bash
npm test             # everything
npm run test:api     # API only
npm run test:ui      # UI only
npm run test:headed  # watch the browser
npm run report       # open the HTML report
```

## Notes
- Restful-booker is a shared public API that resets often and has deliberate bugs. Each test creates and deletes its own booking so tests don't depend on existing data.
- If a test fails on that API, check the bug yourself against the docs before assuming your test is wrong.
- Quirks worth noticing: bad login returns 200 with a `reason`, and DELETE returns 201.

## Practice ideas
- Add a Page Object for the todo page.
- Add schema checks for booking responses.
- Try `page.route` on the UI to mock or block requests.
- Write tests for the booking `checkin` / `checkout` filters and see what the API actually does.
