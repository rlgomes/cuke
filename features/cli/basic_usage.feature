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

  Scenario: User can run a test and provide environment variables
    Given I run the command "cuke run data/features/logging.feature:9 --env USER=foobar --output ${OUTPUT_DIR}/cli_env_option"
     Then I should see that "${result.stdout}" contains "hello there foobar"

  Scenario: User gets a non zero exit code when running a sceanrio that fails
    Given I run the command "cuke run data/features/feature_with_failing_scenario.feature --env USER=foobar --output ${OUTPUT_DIR}/cli_basic_failing_scenario"
     Then I should see that "${result.stdout}" contains "✘ failed"
      And I should see that "${result.status}" is equal to "1" 

