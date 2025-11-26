Feature: Header steps
  As an automation engineer I want the header steps to work as expected

  Scenario: User can assert header is present
    Given I open a browser at "file://${PWD}/data/header.html"
     Then I should see the header "h1 header"
     Then I should see the header "h2 header"
     Then I should see the header "h3 header"
     Then I should see the header "h4 header"
     Then I should see the header "h5 header"
     Then I should see the header "h6 header"

  Scenario: User can assert header is not present
    Given I open a browser at "file://${PWD}/data/header.html"
     Then I should not see the header "non-existent header"

  Scenario: User can wait to see header
    Given I open a browser at "file://${PWD}/data/header.html"
     Then I should see the header "delayed header"
