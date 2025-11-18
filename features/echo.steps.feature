Feature: Echo steps
  ...

  Scenario: User can log a string to the console
    Given I echo "${HOME}"
  
  Scenario: User can log strings with special characters in it
    Given I echo "foo \n bar and someimes 'special' \"strings\""
  
  Scenario: User can log strings with special characters in it
    Given I echo the following:
      """
      hello ${USER}
      """
