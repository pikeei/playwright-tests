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

