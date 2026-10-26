@varbase-ai-search-base @ai @recipes @access @local @development @staging @production
Feature: Varbase AI Recipe - AI Search Base - Who can manage the vector index
  As a site owner
  I want only the super administrator to manage the vector index
  So that the AI search configuration and its database are not exposed

  Scenario Outline: Check the "<user>" user cannot open the vector index
    Given I am a logged in user with the "<user>" user
     When I go to "/admin/config/search/search-api/index/content_vector"
     Then the response status code should be 403
      And I should see "Access denied"

    Examples:
      | user           |
      | Content editor |
      | Content admin  |
      | SEO admin      |
      | Site admin     |

  Scenario: Check an anonymous visitor cannot open the vector index
    Given I am an anonymous user
     When I go to "/admin/config/search/search-api/index/content_vector"
     Then the response status code should be 403
      And I should not see "Content vector (Ask AI)"
