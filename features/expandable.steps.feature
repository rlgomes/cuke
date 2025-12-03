Feature: Expandable item steps
  As an automation engineer I want the expandable item steps to work as expected

  Scenario: User can assert an expandable item is present
    Given I open a browser at "file://${PWD}/data/expandable.html"
     Then I should see the expandable item "Native Details"
      And I should see the expandable item "ARIA Button"

  Scenario: User can open and close a native details element
    Given I open a browser at "file://${PWD}/data/expandable.html"
     When I open the expandable item "Native Details"
     Then I should see the expandable item "Native Details" is open
     When I close the expandable item "Native Details"
     Then I should see the expandable item "Native Details" is closed

  Scenario: User can open and close an ARIA expandable button
    Given I open a browser at "file://${PWD}/data/expandable.html"
     When I open the expandable item "ARIA Button"
     Then I should see the expandable item "ARIA Button" is open
     When I close the expandable item "ARIA Button"
     Then I should see the expandable item "ARIA Button" is closed
