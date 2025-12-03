Feature: Radio steps
  As an automation engineer I want the radio steps to work as expected 

  Scenario: User can assert a radio is present
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio with next sibling label"
  
  Scenario: User can assert the state of a radio and change it
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio with next sibling label" is not selected
     When I select the radio button "radio with next sibling label"
     Then I should see the radio button "radio with next sibling label" is selected

  Scenario: User can interact with a radio wrapped with a label
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio wrapped with a label" is not selected
     When I select the radio button "radio wrapped with a label"
     Then I should see the radio button "radio wrapped with a label" is selected

  Scenario: User can interact with a radio with next nested sibling label
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio with next nested sibling label"
     When I select the radio button "radio with next nested sibling label"
     Then I should see the radio button "radio with next nested sibling label" is selected

  Scenario: User can interact with a radio with '" in the name
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio with '\" in the name" is not selected
     When I select the radio button "radio with '\" in the name"
     Then I should see the radio button "radio with '\" in the name" is selected

  Scenario: User can wait to select a radio
    Given I open a browser at "file://${PWD}/data/radios.html"
     When I select the radio button "radio that appears 2 seconds later"
     Then I should see the radio button "radio that appears 2 seconds later" is selected

  Scenario: User can wait up to a specific number of seconds to select a radio
    Given I open a browser at "file://${PWD}/data/radios.html"
     When I select the radio button "radio that appears 2 seconds later" waiting up to "5" seconds
     Then I should see the radio button "radio that appears 2 seconds later" is selected

  Scenario: User can wait to see a radio
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that appears 2 seconds later"

  Scenario: User can wait up to a specific number of seconds to see a radio
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that appears 2 seconds later" waiting up to "5" seconds

  Scenario: User can wait to see a radio is selected
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that becomes selected" is selected

  Scenario: User can wait up to a specific number of seconds to see a radio is selected
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that becomes selected" is selected waiting up to "5" seconds

  Scenario: User can wait to see a radio is not selected
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that becomes unselected" is not selected

  Scenario: User can wait up to a specific number of seconds to see a radio is not selected
    Given I open a browser at "file://${PWD}/data/radios.html"
     Then I should see the radio button "radio that becomes unselected" is not selected waiting up to "5" seconds
