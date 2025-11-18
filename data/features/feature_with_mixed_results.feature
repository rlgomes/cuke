Feature: Feature with mixed results

  Scenario: Scenario that passes
    Given I echo "hello world"

  Scenario: Scenario that fails
    Given I fail

  @disabled
  Scenario: Scenario that is disabled
    Given I fail
  
  Scenario: Scenario that has undefined step
    Given I am undefined
