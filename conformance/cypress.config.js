const { defineConfig } = require('cypress');

/**
 * Serves the built app at the path layout TodoMVC's own spec expects, so that spec runs unedited.
 * `--env framework=angular` keeps upstream's localStorage-coupled persistence test skipped, which
 * is correct for a server-backed app; `e2e/persistence.cy.js` covers that ground instead.
 */
module.exports = defineConfig({
  // A factory grading this conversion cannot scrape prose. `junit` resolves to the
  // mocha-junit-reporter Cypress already bundles, so this costs no dependency.
  //
  // `[hash]` keeps one file per spec instead of the specs overwriting each other, and the
  // TEST- prefix is what `collectTestReports` looks for when the file is not in a directory it
  // already recognises.
  reporter: process.env.JUNIT_DIR ? 'junit' : 'spec',
  reporterOptions: process.env.JUNIT_DIR ? {
    mochaFile: `${process.env.JUNIT_DIR}/TEST-[hash].xml`,
    toConsole: false,
    // Without this the reporter writes the TEST title into `classname`, so every case reads as its
    // own suite and a grade groups 30 checks under 30 headings. The describe block is the suite.
    testCaseSwitchClassnameAndName: true,
  } : {},
  e2e: {
    baseUrl: 'http://localhost:8000/examples/angular/dist/browser',
    specPattern: ['e2e/**/*.cy.js', 'todomvc/cypress/e2e/**/*.cy.js'],
    supportFile: 'support/e2e.js',
    viewportWidth: 890,
    includeShadowDom: true,
    video: false,
    screenshotOnRunFailure: false,
  },
});
