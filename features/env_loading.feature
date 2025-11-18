Feature: Env Loading
  As a developer I want to be sure that the environment loading feature in cuke
  works as expected when loading environment variables from .env files or the
  existing process environment space

  Scenario: User can load .env files at different directory levels before the feature file
    Given I run the command "cuke run --output ${OUTPUT_DIR}/env_loading_levels data/features/env_loading/more/example.feature"
     Then I should see that "${result.stdout}" contains "bar comes from the env_loading/.env file"
      And I should see that "${result.stdout}" contains "buzz comes from the env_loading/more/.env file"
      And I should see that "${result.status}" is equal to "0"
