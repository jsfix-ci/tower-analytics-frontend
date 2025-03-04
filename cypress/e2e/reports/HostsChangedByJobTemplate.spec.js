import { reportsUrl, hcbjt } from '../../support/constants';

describe('Report: Hosts Changed By Job Template Smoketests', () => {
  beforeEach(() => {
    cy.loginFlow();
    cy.visit(reportsUrl + '/' + hcbjt);
    cy.getByCy('loading').should('not.exist');
    cy.getByCy('api_error_state').should('not.exist');
  });
  afterEach(() => {
    cy.get('#UserMenu').click();
    cy.get('button').contains('Log out').click({force: true});
  });

  it('Can Switch between Line and Bar chart without breaking UI', () => {
    cy.get('#bar').click();
    cy.get('#line').click();
  });

  it('Can change lookback', () => {
    cy.getByCy('quick_date_range').click();
    cy.get('.pf-c-select__menu-item').contains('Past year').click();
  });
});
