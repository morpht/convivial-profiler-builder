describe('Convivial Profiler Builder: Test - Application', () => {
  beforeEach(() => {
    // Open the homepage before each test
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Configuration Tab - Save configuration form, check popup message, click Okay, and verify local storage.', () => {
    // Flush local storage.
    cy.clearLocalStorage();

    // Check the local storage variable 'convivial_profiler_builder_settings' does not exist.
    cy.getLocalStorage('convivial_profiler_builder_settings')
      .then($convivial_profiler_builder_settings => {
        expect($convivial_profiler_builder_settings).to.equal(null);
      });

    // Go to Configuration tab.
    cy.get('#configuration-tab').click();

    // Fill and submit the form.
    cy.get('#configuration').within(() => {
      cy.get('#sourceUrl').should('have.value', 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_source.yml');
      cy.get('#processorUrl').should('have.value', 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_processor.yml');
      cy.get('#destinationUrl').should('have.value', 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_destination.yml');
      // Click the submit button.
      cy.get('button[type="submit"]').click();
    });

    // Verify the popup appears with the correct message.
    cy.get('.swal-modal')
      .should('be.visible')
      .and('contain.text', 'Schema configuration saved.');

    // Close the popup.
    cy.get('.swal-modal .swal-button-container .swal-button--confirm')
      .click();

    // Check the local storage variable 'convivial_profiler_builder_settings'.
    cy.getLocalStorage('convivial_profiler_builder_settings').then((value) => {
      const expectedValue = {
        sources: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_source.yml',
        processors: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_processor.yml',
        destinations: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_destination.yml'
      };

      // Assert that the local storage value matches the expected value.
      expect(JSON.parse(value)).to.deep.equal(expectedValue);
    });
  });

  it('UI Builder Tab - Save UI Builder form.', () => {
    // Go to UI Builder tab.
    cy.get('#builder-settings-tab').click();

    // Fill the settings.
    cy.get('#ui-builder-settings').within(() => {
      cy.get('input[name="site-id"]').should('have.value', '');
      cy.get('input[name="license-key"]').should('have.value', '');
      cy.get('input[name="client-cleanup"]').should('not.be.checked');

      cy.get('input[name="site-id"]').type('convivial-demo');
      cy.get('input[name="license-key"]').type('community');
      cy.get('input[name="client-cleanup"]').check();
    });

    // Go to Profilers tab.
    cy.get('#builder-profilers-tab').click();

    // There are no profilers.
    cy.get('#profilersTable tbody').find('tr').should('have.length', 0);
  });
});
