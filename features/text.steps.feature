Feature: Text steps
  As an automation engineer I want the text steps to work as expected

  Scenario: User can assert text is present
    Given I open a browser at "file://${PWD}/data/text.html"
     Then I should see the text "some text in a header"

  Scenario: User can assert text is not present
    Given I open a browser at "file://${PWD}/data/text.html"
     Then I should not see the text "text that does not exist"

  Scenario: User can wait to see text
    Given I open a browser at "file://${PWD}/data/text.html"
     Then I wait to see the text "text that appears 2 seconds later"

  Scenario: User can wait to not see text
    Given I open a browser at "file://${PWD}/data/text.html"
     Then I should see the text "This is some visible text"
     Then I wait to not see the text "This is some visible text"

  Scenario: User can hover over text
    Given I open a browser at "file://${PWD}/data/text.html"
     Then I should see the text "not hovered"
     When I hover over the text "text to hover over"
     Then I should see the text "hovered"

