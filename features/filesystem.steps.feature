Feature: File system steps
  As an automation engineer I want to be sure users can interact with the
  file system as needed.

  Scenario: User can write and read a file
    Given I write to the file "${CUKE_OUTPUT}/filesystem_tests/output.txt" the following:
      """
      hello world
      """
     When I read the file "${CUKE_OUTPUT}/filesystem_tests/output.txt" contents to the variable "DATA"
     Then I should see that "${DATA}" is equal to "hello world"
