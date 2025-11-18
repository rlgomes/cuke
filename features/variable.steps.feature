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
