# Measured baseline — the "before" of the migration

Recorded 2026-09-16. Host: macOS, JDK 26, colima/docker 29.2.1, aarch64.
Everything below ran **in containers**; nothing was installed on the host.

| suite | author | result |
|---|---|---|
| `todo-backend-js-spec` contract (12) | TodoBackend | **12 passed, 0 failed** |
| TodoMVC browser spec (29) | TodoMVC, unedited, pinned `ff43b02` | **27 passed, 0 failed, 2 pending** |
| server persistence (3) | ours | **3 passed** |

## The two pending tests are upstream's own decisions, not ours

- `should persist its data` — asserts `localStorage` contents directly. TodoMVC lists both
  `angular` and `svelte` under `noLocalStorageCheck`. A server-backed app fails those assertions
  while persisting correctly, so it stays pending and `e2e/persistence.cy.js` covers the intent.
- `should respect the back button` — in TodoMVC's `tests/knownIssues.js` as
  `'angular, should respect the back button'`, with their comment: the Angular Router does not
  propagate hash-based popstate. Pre-existing upstream; nothing to do with this estate.

## Five defects this baseline surfaced, each fixed at its cause

None were found by reading code. All five were found by running the suites in the estate, and
each one is a way the application could have looked correct while being wrong.

1. **Zoneless change detection.** Angular 21 is zoneless by default, so a settling promise does
   not trigger a render. The first `GET` returned 200 with two todos and the service held them
   while `.todo-list li` stayed at 0 until an unrelated keystroke. Fixed by making the list a
   signal — upstream never noticed because nothing there was async.
2. **A hardcoded base URL.** The backend built each todo's `url` from one configured value, which
   is wrong for two of its three audiences. 8 of 12 contract assertions failed from inside the
   estate network while passing from the host. Fixed by deriving the base per request from the
   forwarding headers.
3. **`POST /api` 301.** nginx redirected `/api` to `/api/`. Harmless for a `GET`, which the
   browser re-issues; silently destructive for a `POST`, whose body does not survive. Creates
   vanished while reads worked, so the app looked fine until a reload. Fixed with an exact-match
   location.
4. **No test isolation.** TodoMVC's suite isolates by clearing `localStorage`, which does nothing
   to a server. 17 todos accumulated across one run and 10 of 29 tests failed on earlier tests'
   state. Fixed in our support file, not in the spec — the same reset serves the Svelte build.
5. **Host processes shadowing the estate.** A stray JDK-26 `java` left over from local
   experimentation held port 8081, so `localhost:8081` reached it instead of the container. The
   estate ran in containers and the tests talked to something else entirely. This is the whole
   argument for the containers: without them the toolchain belongs to the laptop.

## What must be true after the migration

The same three suites, at the same pinned commits, against `todo-svelte` instead of
`todo-angular`, with `todo-backend-java` byte-identical. The only permitted change to the
conformance setup is `CYPRESS_app`.
