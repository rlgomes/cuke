Feature: Switch steps
  As an automation engineer I want the switch steps to work as expected

  Scenario: User can assert a switch is present
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch with next sibling label"

  Scenario: User can turn on a switch
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch with next sibling label" is off
     When I turn on the switch "switch with next sibling label"
     Then I should see the switch "switch with next sibling label" is on

  Scenario: User can turn off a switch
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch that is on" is on
     When I turn off the switch "switch that is on"
     Then I should see the switch "switch that is on" is off

  Scenario: User can interact with a switch wrapped with a label
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch wrapped with a label" is off
     When I turn on the switch "switch wrapped with a label"
     Then I should see the switch "switch wrapped with a label" is on

  Scenario: User can wait to turn on a switch
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch that turns on" is off
     When I wait to turn on the switch "switch that turns on"
     Then I should see the switch "switch that turns on" is on

  Scenario: User can assert a switch is on
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch that is on" is on

  Scenario: User can assert a switch is off
    Given I open a browser at "file://${PWD}/data/switches.html"
     Then I should see the switch "switch with next sibling label" is off
