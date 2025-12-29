Feature: LLM steps
  As an automation engineer I want ...

  Scenario: User can assert a button is present
    Given I open a browser at "file:///${PWD}/data/buttons.html"
      And I should see the button "button with inner text label"
     Then I ask AI to validate on screen the following:
      """
      * a button with the name "button with inner text label"
      * the button "button with inner node label"
      """
