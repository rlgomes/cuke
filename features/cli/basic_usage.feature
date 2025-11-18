Feature: Basic CLI Usage
  As a developer I want to the cuke command line usage to work as expected

  # XXX: way more test needed here and for the CLI in general

  Scenario: User can get help menu when no arguments are given
    Given I run the command "cuke"
     Then I should see that "${result.stdout}" is empty
      And I should see that "${result.stderr}" contains the following:
      """
      Usage: cuke [options] [command]
      """
