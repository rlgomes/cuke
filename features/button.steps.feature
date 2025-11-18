Feature: Button steps
  As an automation engineer I want the button steps to work as expected

  Scenario: User can assert a button is present
    Given I open a browser at "file:///${PWD}/data/buttons.html"
      And I should see the button "button with inner text label"
     Then I wait to see the button "button with inner text label"

  Scenario: User can wait to see a button is present
    Given I open a browser at "file:///${PWD}/data/buttons.html"
     Then I wait to see the button "button that appears 2 seconds later"
  
  Scenario: User can wait to see a button is enabled
    Given I open a browser at "file:///${PWD}/data/buttons.html"
     Then I wait to see the button "button that becomes enabled" is enabled

  Scenario: User can click a button with inner text label
    Given I open a browser at "file:///${PWD}/data/buttons.html"
     When I wait to click the button "button with inner text label"
     Then I should see the input "last touched" is equal to "button with inner text label"

  Scenario: User can click a button with inner node label
    Given I open a browser at "file:///${PWD}/data/buttons.html"
     When I wait to click the button "button with inner node label"
     Then I should see the input "last touched" is equal to "button with inner node label"
