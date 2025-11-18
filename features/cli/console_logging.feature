Feature: Console Logging

  Scenario: User can use various echo steps to place statements into the console
    Given I run the command "cuke run --output ${OUTPUT_DIR}/cli_console_output/ data/features/logging.feature"
      And I should see that "${result.stdout}" contains the following:
      """
      hello there ${USER}
      """
