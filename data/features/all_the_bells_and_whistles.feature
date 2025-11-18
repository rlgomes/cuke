@feature-level-tag
Feature: With all the bells and whistles
  As a developer I want to be sure these descriptions look the same as they did
  in the original feature file including break lines an indentation

  @scenario-level-tag1
  Scenario: Scenario with all the bells and whistles
    Given I echo "something something"
      And I echo the following:
      """
      multiline
      output
      """
     Then I echo the following:
      | type | message     |
      | echo | hello world |
  

  @scenario-level-tag2
  Scenario Outline: Scenario Outline with all the bells and whistles
    Given I echo "some dynamic data: <data>"

    Examples:
      | data              |
      | hello cruel world |
      | hello world       |

  @scenario-level-tag3
  Scenario: Scenario with a failing step
    Given I fail

