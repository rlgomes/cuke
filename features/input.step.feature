Feature: Input steps
  As an automation engineer I want the input steps to work as expected

  Scenario: User can see an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input with placeholder"

  Scenario: User can wait to see an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that appears 2 seconds later"
  
  Scenario: User can wait up to a specific number of seconds to see an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that appears 2 seconds later" waiting up to "5" seconds

  Scenario: User can wait to see an input is enabled
    Given I open a browser at "file:///${PWD}/data/inputs.html"
    Then I should see the input "input that becomes enabled" is enabled

  Scenario: User can wait up to a specific number of seconds to see an input is enabled
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that becomes enabled" is enabled waiting up to "5" seconds

  Scenario: User can see an input is disabled
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that stays disabled" is disabled

  Scenario: User can wait up to a specific number of seconds to see an input is disabled
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that stays disabled" is disabled waiting up to "5" seconds

  Scenario: User can assert an input is not visible
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should not see the input "input that disappears"

  Scenario: User can wait up to a specific number of seconds to assert an input is not visible
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should not see the input "input that disappears" waiting up to "5" seconds

  Scenario: User can write into an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I write "foo" into the input "input with placeholder"
     Then I should see the input "last touched" is equal to "input with placeholder"
      And I should see the input "input with placeholder" is equal to "foo"

  Scenario: User can wait up to a specific number of seconds to write into an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I write "bar" into the input "input that appears 2 seconds later" waiting up to "5" seconds
     Then I should see the input "input that appears 2 seconds later" is equal to "bar"

  Scenario: User can clear an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I write "test value" into the input "input with placeholder"
      And I clear the input "input with placeholder"
     Then I should see the input "input with placeholder" is equal to ""

  Scenario: User can check input value is equal to expected value
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I write "expected value" into the input "input with placeholder"
     Then I should see the input "input with placeholder" is equal to "expected value"

  Scenario: User can wait up to a specific number of seconds to check input value is equal to expected value
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     Then I should see the input "input that changes value" is equal to "changed" waiting up to "5" seconds

  Scenario: User can send a key to an input
    Given I open a browser at "file:///${PWD}/data/inputs.html"
     When I send the key "Enter" to the input "input for enter key"
     Then I should see the input "input for enter key" is equal to "entered"


