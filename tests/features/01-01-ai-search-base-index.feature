@varbase-ai-search-base @ai @recipes @local @development @staging @production
Feature: Varbase AI Recipe - AI Search Base - A vector index of the site's content
  As a site builder
  I want every node and Canvas page embedded into a vector index on the site's vector database
  So that Ask AI and the chatbot can answer from the site's own content

  Background:
    Given I am a logged in user with the "Webmaster" user

  Scenario: Check the webmaster sees the site's content in a vector index connected to its vector database
     When I go to "/admin/config/search/search-api/server/content_vector"
     Then I should see "Collection status Successfully connected"
     When I go to "/admin/config/search/search-api/index/content_vector"
     Then I should see "Every node and Canvas page, chunked and embedded for AI Answers."
      And I should see "Status enabled"
