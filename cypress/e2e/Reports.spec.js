import { reportsUrl, allReports } from '../support/constants';

describe('Reports page smoketests', () => {
  beforeEach(() => {
    cy.loginFlow();
    cy.intercept('/api/tower-analytics/v1/event_explorer_options/').as('eventExplorerOptions');
    cy.visit(reportsUrl);
    cy.getByCy('loading').should('not.exist');
    cy.getByCy('api_error_state').should('not.exist');
    cy.wait('@eventExplorerOptions');
    cy.get('.pf-c-empty-state__content').should('not.exist');
  });
  afterEach(() => {
    cy.get('#UserMenu').click();
    cy.get('button').contains('Log out').click({ force: true });
  });

  it('All report cards are displayed on main reports page', () => {
    allReports.forEach((item) => {
      cy.getByCy(item).should('exist');
    });
  });
  it('All report cards have correct href in the title', () => {
    allReports.forEach((item) => {
      cy.getByCy(item).should('exist');
      cy.getByCy(item).find('a')
        .should('have.attr', 'href', '/beta/ansible/automation-analytics' + reportsUrl + '/' + item);
    });
  });
  it('All report cards can be selected for the preview with correct links', () => {
    allReports.forEach((item) => {
      cy.getByCy(item).should('exist');
      cy.getByCy(item).click();
      cy.getByCy('loading').should('not.exist');
      cy.getByCy('api_error_state').should('not.exist');
      cy.get('.pf-c-empty-state').should('not.exist');
      // correct card is highlighted
      cy.getByCy(item).should('have.class', 'pf-m-selected-raised');
      // check View full report link is correct
      cy.get(`[data-cy="view_full_report_link"]`)
        .should('have.attr', 'href', '/beta/ansible/automation-analytics' + reportsUrl + '/' + item);
      // check Title link is correct
      cy.getByCy('preview_title_link')
        .should('have.attr', 'href', '/beta/ansible/automation-analytics' + reportsUrl + '/' + item);
    });
  });
  it('All report cards can appear in preview via dropdown', () => {
    allReports.forEach((item) => {
      cy.getByCy(item).should('exist');
      cy.get('a').should('have.href', '/beta/ansible/automation-analytics' + reportsUrl + '/' + item);
    });
  });
  it('All report are accessible in preview via arrows', () => {
    let originalTitlePreview = cy.getByCy('preview_title_link').textContent;
    allReports.forEach(() => {
      cy.getByCy('next_report_button').click();
      cy.getByCy('preview_title_link').then(($previewTitle) => {
        const newTitlePreview = $previewTitle.text();
        expect(newTitlePreview).not.to.eq(originalTitlePreview);
        originalTitlePreview = newTitlePreview;
      });
    });
    allReports.forEach(() => {
      cy.getByCy('previous_report_button').click();
      cy.getByCy('preview_title_link').then(($previewTitle) => {
        const newTitlePreview = $previewTitle.text();
        expect(newTitlePreview).not.to.eq(originalTitlePreview);
        originalTitlePreview = newTitlePreview;
      });
    });
  });
  it('All report are accessible in preview via dropdownn', () => {
    cy.getByCy('selected_report_dropdown').should('exist');
    allReports.forEach(($item, index) => {
      cy.getByCy('selected_report_dropdown').click();
      cy.get('ul.pf-c-dropdown__menu > button > li > a').should('exist');
      cy.get('ul.pf-c-dropdown__menu > button > li > a').eq(index).click();
      cy.getByCy('preview_title_link').invoke('text').then(($text) => {
        cy.get('[data-cy="selected_report_dropdown"] > span.pf-c-dropdown__toggle-text')
          .invoke('text').should('eq', $text)
      });
    });
  });
});
