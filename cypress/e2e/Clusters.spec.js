/* global cy */
import { clustersUrl } from '../support/constants';
const appid = Cypress.env('appid');

describe('Clusters page', () => {
  beforeEach(() => {
    cy.loginFlow();
    cy.visit(clustersUrl);

    cy.get('[data-cy="spinner"]').should('not.exist');
    cy.get('[data-cy="loading"]').should('not.exist');
    cy.get('[data-cy="header-clusters"]').should('be.visible');
    cy.get('[data-cy="filter-toolbar"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.get('[data-cy="card-title-job-status"]', {
      timeout: 10000,
    }).should('be.visible');
  });

  it('loads clusters page with Bar graph and other tables', () => {
    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('[data-cy="card-title-job-status"]').find('h2').contains('Job status').should('exist');
    cy.get('[data-cy="barchart"]').should('exist');
    cy.get('#d3-bar-chart-root').should('exist');
    cy.get('button').contains('Clear all filters').should('exist');
    cy.get('h3').contains('Top workflows').should('exist');
    cy.get('h3').contains('Top templates').should('exist');
    cy.get('h3').contains('Top modules').should('exist');
  });

  // Reseting filter will set Job to Workflow Job and Playbook run
  it('has anchor clear filters link that sets the state to default', () => {
    cy.get('.pf-c-empty-state__content').should('not.exist');

    cy.get('[data-cy="category_selector"]').find('button').click();
    cy.get('button').contains('Cluster').click();
    cy.get('[data-cy="cluster_id"]').find('button').click();
    cy.get('[data-cy="1811"]').find('input').check();

    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('.pf-c-chip-group__main').contains('Cluster').should('exist');
    cy.get('.pf-c-chip-group__main').contains('10.0.110.68').should('exist');

    cy.get('button').contains('Clear all filters').click({force: true});

    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('.pf-c-chip-group__main').contains('Cluster').should('not.exist');
    cy.get('.pf-c-chip-group__main').contains('10.0.110.68').should('not.exist');
  });

  it('Query parameters are stored in the URL to enable refresh', () => {
    cy.get('[data-cy="job_type"]').click();
    cy.get('span').contains('Workflow job').click();
    cy.url().should('not.include', 'job_type[]=workflowjob');

    cy.get('[data-cy="quick_date_range"]').click();
    cy.contains('Past 62 days').click();
    cy.url().should('include', 'quick_date_range=last_62_days');
  });

  xit('Hover over each bar in bar chart', () => {
    cy.get('.pf-c-empty-state__content').should('not.exist');
    cy.get('g.layer')
      .each(($element) => {
        cy.get(appid)
          .find('#d3-bar-chart-root > svg > g > g > path')
          .eq(ix)
          .trigger('mouseover', { force: true });
      });
  });

  xit('Hover over each row in all tables', () => {
    cy.get(appid)
      .find('*[class^="pf-c-data-list pf-m-grid-md"]')
      .each((_slice, ix) => {
        cy.get(appid)
          .find('*[class^="pf-c-data-list pf-m-grid-md"] > li > div')
          .eq(ix)
          .trigger('mouseover', { force: true });
      });
  });

  xit('Hover over each row in Top modules table', () => {
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
