@variables
Feature: Built in variables
  As a developer I want to be sure that various built in variables work as
  expected so they can be used by test writers.

  Scenario: User can reference a unique run id
    Given I echo "${RUN_ID}"
