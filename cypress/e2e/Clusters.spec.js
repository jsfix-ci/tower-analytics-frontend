/* global cy */
import { clustersUrl } from '../support/constants';
const appid = Cypress.env('appid');

describe('Clusters page', () => {
  beforeEach(() => {
    cy.loginFlow();
    cy.visit(clustersUrl);
    cy.get('[data-cy="spinner"]').should('not.exist');
    cy.get('[data-cy="loading"]').should('not.exist');
    cy.get('[data-cy="header-clusters"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.get('[data-cy="filter-toolbar"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.get('[data-cy="card-title-job-status"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.intercept('/api/tower-analytics/v1/event_explorer/*').as(
      'eventExplorerData'
    );
  });

  it('loads clusters page with Bar graph and other tables', () => {
    cy.get('[data-cy="card-title-job-status"]').find('h2').textContent;
    cy.contains('Clear all filters').should('exist');
    cy.contains('Top workflows');
    cy.contains('Top templates');
    cy.contains('Top modules');
    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('[data-cy="card-title-job-status"]')
      .find('h2')
      .contains('Job status')
      .should('exist');
    cy.get('[data-cy="barchart"]').should('exist');
    cy.get('#d3-bar-chart-root').should('exist');
    cy.get('button').contains('Clear all filters').should('exist');
    cy.get('h3').contains('Top workflows').should('exist');
    cy.get('h3').contains('Top templates').should('exist');
    cy.get('h3').contains('Top modules').should('exist');
  });

  it('verifies number of items in API response', () => {
    cy.get('[data-cy="card-title-job-status"]').find('h2').textContent;

    cy.get('[data-cy="barchart"]');
    cy.get('#d3-bar-chart-root');
    cy.get('div.pf-c-empty-state__content').should('not.exist');
    // get the same request object again and confirm the response
    cy.get('@eventExplorerData')
      .its('response')
      .then((res) => {
        expect(res.body.items).to.length(5);
        expect(res.body.meta.count).to.eq(5);
        expect(res.body.meta.legend).to.length(5);
      });
  });

  it('has anchor clear filters link', () => {
    cy.get('div.pf-c-empty-state__content').should('not.exist');

    cy.get('[data-cy="filter-toolbar"')
      .find('button')
      .contains('Clear all filters')
      .click({ force: true });
    cy.get('.pf-c-empty-state__content').should('not.exist');
    // Add Cluster to the filters
    cy.get('[data-cy="category_selector"]').find('button').click();
    cy.get('button').contains('Cluster').click();
    cy.get('[data-cy="cluster_id"]').find('button').click();
    cy.get('[data-cy="1811"]').find('input').check();
    // Wait for loading and check the selected filter is present
    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('.pf-c-chip-group__main').contains('Cluster').should('exist');
    cy.get('.pf-c-chip-group__main').contains('10.0.110.68').should('exist');

    cy.get('[data-cy="filter-toolbar"')
      .find('button')
      .contains('Clear all filters')
      .click({ force: true });
    // Wait and check that the filter is no longer present
    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('.pf-c-chip-group__main').contains('Cluster').should('not.exist');
    cy.get('.pf-c-chip-group__main')
      .contains('10.0.110.68')
      .should('not.exist');
  });

  it('Query parameters are stored in the URL to enable refresh', () => {
    cy.get('[data-cy="job_type"]').click();
    cy.contains('Workflow job').click();
    cy.url().should('not.include', 'job_type[]=workflowjob');

    cy.get('[data-cy="quick_date_range"]').click();
    cy.contains('Past 62 days').click();
    cy.url().should('include', 'quick_date_range=last_62_days');
  });

  it('Hover over each bar in bar chart', () => {
    cy.get(appid)
      .find('#d3-bar-chart-root > svg > g > g > path')
      .each((_slice, ix) => {
        cy.get(appid)
          .find('#d3-bar-chart-root > svg > g > g > rect')
          .eq(ix)
          .trigger('mouseover', { force: true });
        cy.get('[id^=svg-chart-Tooltip]').should('have.css', 'opacity', '1');
      });
  });

  it('Hover over each row in all tables', () => {
    cy.get(appid)
      .find('*[class^="pf-c-data-list pf-m-grid-md"]')
      .each((_slice, ix) => {
        cy.get(appid)
          .find('*[class^="pf-c-data-list pf-m-grid-md"] > li > div')
          .eq(ix)
          .trigger('mouseover', { force: true });
      });
  });

  it('Hover over each row in Top modules table', () => {
    cy.get(appid)
      .find('[data-cy="top-modules-header"]')
      .each((_slice, ix) => {
        cy.get(appid)
          .find('[data-cy="top-modules-header"] > ul> li > div')
          .eq(ix)
          .trigger('mouseover', { force: true });
      });
  });
});
