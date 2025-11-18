Feature: Checkbox steps
  As an automation engineer I want the checkbox steps to work as expected 

  Scenario: User can assert a checkbox is present
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox with next sibling label"
  
  Scenario: User can assert the state of a checkbox and change it
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox with next sibling label" is unchecked
     When I check the checkbox "checkbox with next sibling label"
     Then I should see the checkbox "checkbox with next sibling label" is checked

  Scenario: User can interact with a checkbox wrapped with a label
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox wrapped with a label" is unchecked
     When I check the checkbox "checkbox wrapped with a label"
     Then I should see the checkbox "checkbox wrapped with a label" is checked

  Scenario: User can interact with a checkbox with next nested sibling label
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox with next nested sibling label"
     When I check the checkbox "checkbox with next nested sibling label"
     Then I should see the checkbox "checkbox with next nested sibling label" is checked

  Scenario: User can interact with a checkbox with '" in the name
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox with '\" in the name" is unchecked
     When I check the checkbox "checkbox with '\" in the name"
     Then I should see the checkbox "checkbox with '\" in the name" is checked
