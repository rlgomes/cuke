Feature: Dropdown steps
  As an automation engineer I want the dropdown steps to work as expected

  Scenario: User can assert a dropdown is present
    Given I open a browser at "file://${PWD}/data/dropdowns.html"
     Then I should see the dropdown "Pick a Pet"
      And I should see the option "Choose an option" in the dropdown "Pick a Pet" is selected
     When I select the option "Dog" from the dropdown "Pick a Pet"
      And I should see the option "Dog" in the dropdown "Pick a Pet" is selected

  Scenario: User can wait to see a dropdown
    Given I open a browser at "file://${PWD}/data/dropdowns.html"
     Then I wait to see the dropdown "dropdown that appears 2 seconds later"

  Scenario: User can wait up to a specific number of seconds to see a dropdown
    Given I open a browser at "file://${PWD}/data/dropdowns.html"
     Then I wait up to "5" seconds to see the dropdown "dropdown that appears 2 seconds later"

  Scenario: User can wait to select an option from a dropdown
    Given I open a browser at "file://${PWD}/data/dropdowns.html"
     When I wait to select the option "Option 1" from the dropdown "dropdown that appears 2 seconds later"
     Then I should see the option "Option 1" in the dropdown "dropdown that appears 2 seconds later" is selected
