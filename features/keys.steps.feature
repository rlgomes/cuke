Feature: Send keys steps
  As an automation engineer I want the send keys steps to work as expected

  Scenario: User can send a key to a specific input
    Given I open a browser at "file://${PWD}/data/keys.html"
     When I send the key "ENTER" to the input "Input 1"
     Then I should see the text "Enter pressed on Input 1"

  Scenario: User can send a key to the focused element
    Given I open a browser at "file://${PWD}/data/keys.html"
     When I write "Foo" into the input "Input 2"
      And I send the key "backspace" to the focused element
     Then I should see the input "Input 2" is equal to "Fo"

  Scenario: User can send a key to the page
    Given I open a browser at "file://${PWD}/data/keys.html"
     When I send the key "ESCAPE" to the page
     Then I should see the text "Escape pressed on page"
