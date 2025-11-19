Feature: Command steps
  As an automation engineer I want to be sure users can run external commmands
  and process exit codes and standard IO as needed.

  Scenario: User can run an external command
    Given I run the following script:
      """
      #!/bin/bash
      echo "hello world"
      """

  Scenario: User can run an external command
    Given I run the command "echo 'hello world'"
     Then I should see that "${result.status}" is equal to "0"
      And I should see that "${result.stdout}" is equal to the following: 
      """
      hello world

      """
      And I should see that "${result.stderr}" is equal to ""

  Scenario: User gets expected exit code when running a failing command
    Given I run the command "ls non-existent-file"
     Then I should see that "${result.status}" is equal to "1"
