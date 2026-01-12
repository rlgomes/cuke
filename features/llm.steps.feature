Feature: LLM steps
  As an automation engineer I want ...

  Scenario: User can assert a button is present
    Given I open a browser at "file:///${PWD}/data/mixed.html"
     Then I ask AI to validate on screen the following:
      """
      * a button with the name: Ok.
      * a disabled button with the name: Sure.
      * I see a checkbox called: Waffles.
      * I shoudln't see a button with the name 'foobar'.
      * I should see a button 'Ok' that is above the button 'Sure'.
      * I should see the checkbox 'Pick me' is below the button Sure and foobar.
      """
