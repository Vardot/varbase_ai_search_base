@varbase-ai-search-base @ai @recipes @local @development @staging @production
Feature: Varbase AI Recipe - AI Search Base - A vector index of the site's content
  As a site builder
  I want a vector server and index of every node and Canvas page on the default vector database
  So that Ask AI and the chatbot can answer from the site's own content

  Background:
    Given I am a logged in user with the "Webmaster" user

  Scenario: Check Search API lists the vector server and index next to the keyword index
     When I go to "/admin/config/search/search-api"
     Then I should see "Content vector (Ask AI)"
      And I should see "Content"

  Scenario: Check the vector server is connected to its collection on the default vector database
     When I go to "/admin/config/search/search-api/server/content_vector"
     Then I should see "AI Search"
      And I should see "Vector Database MariaDB vector DB"
      And I should see "Collection name content_vector"
      And I should see "Collection status Successfully connected"

  Scenario: Check the vector index covers content and Canvas pages and is enabled
     When I go to "/admin/config/search/search-api/index/content_vector"
     Then I should see "Every node and Canvas page, chunked and embedded for AI Answers."
      And I should see "Datasource Content"
      And I should see "Datasource Page"
      And I should see "AI Search Chunked Tracker"
      And I should see "Status enabled"

  @ai-provider
  Scenario: Verify the content is embedded into the vector index
     When I go to "/admin/config/search/search-api/index/content_vector"
      And I press "Index now"
     Then eventually I should see "Successfully indexed" within 120 seconds
