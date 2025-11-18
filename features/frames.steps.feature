Feature: Frames steps
  As an automation engineer I want the various steps to work as expected across
  frames

  Scenario: User can assert various elements across iframes
    Given I open a browser at "file:///${PWD}/data/frames.html"
     Then I should see the button "button with inner text label"
      And I should see the checkbox "checkbox with next sibling label"
      And I should see the dropdown "dropdown with previous sibling label"
