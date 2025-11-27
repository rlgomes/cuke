Feature: Basic CLI Usage
  As a developer I want to the cuke command line usage to work as expected

  Scenario: User can get help menu when no arguments are given
    Given I run the command "cuke"
     Then I should see that "${result.stdout}" is equal to ""
      And I should see that "${result.stderr}" contains the following:
      """
      Usage: cuke [options] [command]
      """

  Scenario: User can list the steps currently available
    Given I run the command "cuke steps"
     Then I should see that "${result.stdout}" contains "I close the current browser"
      And I should see that "${result.stderr}" is equal to ""
