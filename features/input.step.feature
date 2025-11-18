Feature: Input steps
  As an automation engineer I want the input steps to work as expected

  Scenario: User can see an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input with placeholder"

  Scenario: User can wait to see an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I wait to see the input "input that appears 2 seconds later"
  
  Scenario: User can wait to see an input is enabled
    Given I open a browser at "file:///${PWD}/data/inputs.html"
    Then I wait to see the input "input that becomes enabled" is enabled

  Scenario: User can write into an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I write "foo" into the input "input with placeholder"
     Then I should see the input "last touched" is equal to "input with placeholder"
      And I should see the input "input with placeholder" is equal to "foo"


