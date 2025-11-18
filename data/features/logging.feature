Feature: Logging
  Basic scenario that produces outputs in a few ways for other tests to validate

  Scenario: Scenario that echoes multiple things across a few steps
    Given I echo "hello"
      And I echo "cruel"
      And I echo "world"

  Scenario: Scenario that echoes variables
    Given I echo "hello there ${USER}"
  
  Scenario: Scenario that echoes variables in a multiline string
    Given I echo the following:
      """
      hello there ${USER}
      """
  
  Scenario: Scenario that echoes variables in a table
    Given I echo the following:
        | hello   |
        | there   |
        | ${USER} |
