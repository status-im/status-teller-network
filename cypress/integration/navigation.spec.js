/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000');
  });

  it('allows to go through the different pages', () => {
    cy.get('.navbar-nav').contains('Prices').click();
    cy.location('hash').should('include', 'price');

    cy.get('.navbar-nav').contains('My Escrows').click();
    cy.location('hash').should('include', 'escrows');

    cy.get('.navbar-nav').contains('Map').click();
    cy.location('hash').should('include', 'map');
  });
});
