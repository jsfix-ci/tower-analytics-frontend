import { reportsUrl, aa21m } from '../../support/constants';

describe('Report: AA 2.1 Migration', () => {
  beforeEach(() => {
    cy.loginFlow();
    cy.visit(reportsUrl + '/' + aa21m);
  });
  afterEach(() => {
    cy.get('#UserMenu').click();
    cy.get('button').contains('Log out').click({force: true});
  });

  it('Can Switch between Line and Bar chart without breaking UI', () => {
    cy.get('#bar').click();
    cy.get('.pf-m-selected').contains('Bar Chart').should('exist');
    cy.get('#line').click();
    cy.get('.pf-m-selected').contains('Line Chart').should('exist');
  });

  it('Can change lookback', () => {
    cy.getByCy('quick_date_range').click();
    cy.get('.pf-c-select__menu-item').contains('Past year').click();
  });
});
