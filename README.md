# todo-estate

The Angular → Svelte migration case study, as a runnable estate.

```bash
docker compose up -d                              # the app on :8080, the API on :8081
docker compose --profile test run --rm backend-contract    # 12 tests — the API contract
docker compose --profile test run --rm conformance         # 31 + 3 tests — the browser
```

Nothing is installed on your machine. No JDK, no Node, no Cypress binary.

## What this is for

A front end is migrated from Angular to Svelte. The claim is that everything continues to work.
Three things make that a measurement rather than an assurance:

1. **The backend does not change.** `todo-backend-java` is byte-identical before and after. One
   variable moves.
2. **The tests are not ours.** TodoMVC's 31-test browser spec is framework-agnostic by design and
   is fetched at a pinned commit, never vendored. The Todo-Backend contract is a published spec
   with a published suite. We cannot quietly adjust either when something goes red.
3. **The toolchain is declared and supplied.** `pom.xml` says `release=21` and the image supplies
   JDK 21 — on a host running JDK 26. `package.json` says `node >=22` and the image supplies it.

## The one test we wrote, and why

TodoMVC's `should persist its data` asserts on `localStorage` contents directly, so it is skipped
for every app that keeps state elsewhere — upstream lists both `angular` and `svelte` under
`noLocalStorageCheck`. Wiring a real backend does not un-skip it; a server-backed app fails those
assertions while persisting correctly.

So `conformance/e2e/persistence.cy.js` covers that ground instead, and its middle test asserts
something `localStorage` is structurally incapable of: **a second browser session, with storage and
cookies cleared, sees the same todos.** That is the difference between "the page remembered" and
"the data is on the server", and it must hold identically on both sides of the migration.

## Repositories

| repo | role | changes during migration? |
|---|---|---|
| `todo-backend-java` | Todo-Backend API, no dependencies | **no** |
| `todo-angular` | the front end being migrated | replaced |
| `todo-svelte` | the migration output | produced by the run |
