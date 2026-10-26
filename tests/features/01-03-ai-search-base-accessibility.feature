@varbase-ai-search-base @ai @recipes @a11y @local @development @staging @production
Feature: Varbase AI Recipe - AI Search Base - Accessible index page
  As a site administrator who uses assistive technology
  I want the vector index page to work with a keyboard and a screen reader
  So that I can manage the index like anyone else

  Scenario: Check the vector index page gives every link a name
    Given I am a logged in user with the "Webmaster" user
     When I go to "/admin/config/search/search-api/index/content_vector"
     Then every link should have an accessible name
      And every ARIA role should be valid
