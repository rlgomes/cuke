Feature: Table steps
  As an automation engineer I want the table steps to work as expected

  Scenario: User can assert a table cell is present
    Given I open a browser at "file://${PWD}/data/tables.html"
     Then I should see the table cell "Cell 1"

  Scenario: User can wait to see a table cell
    Given I open a browser at "file://${PWD}/data/tables.html"
     Then I wait to see the table cell "cell that appears 2 seconds later"

  Scenario: User can click a table cell
    Given I open a browser at "file://${PWD}/data/tables.html"
     When I click the table cell "clickable cell"
     Then I should see the input "last clicked" is equal to "clickable cell"

  Scenario: User can wait to click a table cell
    Given I open a browser at "file://${PWD}/data/tables.html"
     When I wait to click the table cell "cell that appears 2 seconds later"
     Then I should see the table cell "cell that appears 2 seconds later"

