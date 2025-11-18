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

  Scenario: User can wait to check a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     When I wait to check the checkbox "checkbox that appears 2 seconds later"
     Then I should see the checkbox "checkbox that appears 2 seconds later" is checked

  Scenario: User can wait up to a specific number of seconds to check a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     When I wait up to "5" seconds to check the checkbox "checkbox that appears 2 seconds later"
     Then I should see the checkbox "checkbox that appears 2 seconds later" is checked

  Scenario: User can uncheck a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox with next sibling label" is unchecked
     When I check the checkbox "checkbox with next sibling label"
     Then I should see the checkbox "checkbox with next sibling label" is checked
     When I uncheck the checkbox "checkbox with next sibling label"
     Then I should see the checkbox "checkbox with next sibling label" is unchecked

  Scenario: User can wait to uncheck a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox to uncheck" is checked
     When I wait to uncheck the checkbox "checkbox to uncheck"
     Then I should see the checkbox "checkbox to uncheck" is unchecked

  Scenario: User can wait up to a specific number of seconds to uncheck a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I should see the checkbox "checkbox to uncheck" is checked
     When I wait up to "5" seconds to uncheck the checkbox "checkbox to uncheck"
     Then I should see the checkbox "checkbox to uncheck" is unchecked

  Scenario: User can wait to see a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait to see the checkbox "checkbox that appears 2 seconds later"

  Scenario: User can wait up to a specific number of seconds to see a checkbox
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait up to "5" seconds to see the checkbox "checkbox that appears 2 seconds later"

  Scenario: User can wait to see a checkbox is checked
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait to see the checkbox "checkbox that becomes checked" is checked

  Scenario: User can wait up to a specific number of seconds to see a checkbox is checked
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait up to "5" seconds to see the checkbox "checkbox that becomes checked" is checked

  Scenario: User can wait to see a checkbox is unchecked
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait to see the checkbox "checkbox that becomes unchecked" is unchecked

  Scenario: User can wait up to a specific number of seconds to see a checkbox is unchecked
    Given I open a browser at "file://${PWD}/data/checkboxes.html"
     Then I wait up to "5" seconds to see the checkbox "checkbox that becomes unchecked" is unchecked
