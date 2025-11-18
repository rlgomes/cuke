Feature: Flow control steps
  As an automation engineer I want to be sure the flow control steps behave as
  expected.

  Scenario: User can fail a test using the "I fail" step
    Given I write to the file "${OUTPUT_DIR}/i_fail_step.feature" the following:
      """
      Feature: Feature file that contains a failing scenario

        Scenario: Just a scenario that fails
          Given I fail
      """
     When I run the command "cuke run ${OUTPUT_DIR}/i_fail_step.feature"
     Then I should see that "${result.stdout}" contains "Error: step failed on purpose"
      And I should see that "${result.status}" is equal to "1"
