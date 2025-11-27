Feature: Variable steps
  As a developer I want to be sure that various step that validate and
  manipulate variables work as expected.


  Scenario: User can resolve variables from the environment in a scenario
    Given I echo the following:
      """
      hello there ${USER}
      """

  Scenario: User can resolve variables from the environment in a scenario
    Given I echo "hello there ${USER}"

  Scenario: User can set a variable and use it in subsequent steps
    Given I set the variable "TEST_VAR" to "test_value"
      And I echo "The value is ${TEST_VAR}"
     Then I should see that "${TEST_VAR}" is equal to "test_value"

  Scenario: User can set a variable with multiline value
    Given I set the variable "MULTILINE_VAR" to the following:
      """
      line 1
      line 2
      line 3
      """
      And I echo "Multiline value: ${MULTILINE_VAR}"
     Then I should see that "${MULTILINE_VAR}" contains "line 2"

  Scenario: User can check if two values are equal
    Given I set the variable "VAR1" to "hello"
      And I set the variable "VAR2" to "hello"
     Then I should see that "${VAR1}" is equal to "${VAR2}"

  Scenario: User can check if two multiline values are equal
    Given I set the variable "VAR1" to the following:
      """
      first line
      second line
      """
      And I set the variable "VAR2" to the following:
      """
      first line
      second line
      """
     Then I should see that "${VAR1}" is equal to the following:
      """
      first line
      second line
      """

  Scenario: User can check if a value contains another value
    Given I set the variable "LONG_TEXT" to "This is a long text string"
     Then I should see that "${LONG_TEXT}" contains "long text"

  Scenario: User can check if a value contains multiline text
    Given I set the variable "MULTILINE_TEXT" to the following:
      """
      This is line one
      This is line two
      This is line three
      """
     Then I should see that "${MULTILINE_TEXT}" contains the following:
      """
      line two
      """

  Scenario: User can check if a value matches a regex pattern
    Given I set the variable "EMAIL" to "user@example.com"
     Then I should see that "${EMAIL}" matches "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

  Scenario: User can check if a value matches a multiline regex pattern
    Given I set the variable "MULTILINE_PATTERN" to the following:
      """
      line 1
      line 2
      line 3
      """
     Then I should see that "${MULTILINE_PATTERN}" matches the following:
      """
      line.*2
      """

  Scenario: User can chain variable operations
    Given I set the variable "BASE" to "hello"
      And I set the variable "GREETING" to "${BASE} world"
     Then I should see that "${GREETING}" is equal to "hello world"
      And I should see that "${GREETING}" contains "${BASE}"
