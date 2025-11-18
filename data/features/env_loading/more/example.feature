Feature: Env Loading

  Scenario: That echoes various variables
    Given I echo "${HOME} comes from the process environment"
      And I echo "${FOO} comes from the env_loading/.env file"
      And I echo "${FIZZ} comes from the env_loading/more/.env file"
