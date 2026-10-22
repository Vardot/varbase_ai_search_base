@varbase-ai @search @recipe
Feature: The Varbase AI Search Base recipe builds a vector index of the site's content
  As a Varbase site builder
  I want the recipe to create the vector server and index on the default vector database
  So that semantic search, Ask AI and the chatbot have the site's content to search

  Background:
    Given I am a logged in user with the "Webmaster" user

  Scenario: Search API lists the vector server and index
    When I navigate to "/admin/config/search/search-api"
    Then I should see "Content vector (Ask AI)"
     And I the page should not have PHP errors

  Scenario: The vector server uses the AI Search backend
    When I navigate to "/admin/config/search/search-api/server/content_vector"
    Then I should see "AI Search"
     And I should see "content_vector"
     And I the page should not have PHP errors

  Scenario: The vector index page loads
    When I navigate to "/admin/config/search/search-api/index/content_vector"
    Then I should see "Content vector (Ask AI)"
     And I the page should not have PHP errors

  Scenario: The keyword Content index from Varbase Search Base is there too
    When I navigate to "/admin/config/search/search-api"
    Then I should see "Content"
     And I the page should not have PHP errors
