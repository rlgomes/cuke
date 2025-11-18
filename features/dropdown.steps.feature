Feature: Dropdown steps
  As an automation engineer I want the dropdown steps to work as expected

  Scenario: User can assert a dropdown is present
    Given I open a browser at the url "file://${PWD}/data/dropdowns.html"
     Then I should see the dropdown "Pick a Pet"
      And I should see the option "Choose an option" in the dropdown "Pick a Pet" is selected
     When I select the option "Dog" from the dropdown "Pick a Pet"
      And I should see the option "Dog" in the dropdown "Pick a Pet" is selected
