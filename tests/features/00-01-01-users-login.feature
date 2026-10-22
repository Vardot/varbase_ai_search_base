@varbase-ai @admin
Feature: Login for the recipe test administrator
  As a site administrator
  I want the Webmaster super-admin to log in and provision the testing users
  So that the recipe scenarios run with known-good users

  Scenario: Webmaster can log in and provision the rest of the testing users
    Given I am a logged in user with the "Webmaster" user
    Then I the page should not have PHP errors
    When I add testing users
     And I navigate to "/admin/people"
    Then I should see "content_editor_user"
     And I should see "authenticated_user"
     And I the page should not have PHP errors
