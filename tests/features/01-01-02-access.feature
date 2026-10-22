@varbase-ai @access
Feature: Only site administrators reach what the Varbase AI Search Base recipe adds
  As a site owner
  I want the vector index kept from visitors who are not administrators
  So that the AI configuration is not exposed

  Scenario: An anonymous visitor cannot open the vector index
    Given I am an anonymous user
    When I navigate to "/admin/config/search/search-api/index/content_vector"
    Then I should not see "Content vector (Ask AI)"
     And I the page should not have PHP errors
