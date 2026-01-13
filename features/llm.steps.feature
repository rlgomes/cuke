Feature: LLM steps
  As an automation engineer I want ...

  Scenario: User can assert a button is present
    Given I open a browser at "file:///${PWD}/data/mixed.html"
     Then I ask AI to validate on screen the following:
      """
      * There should be two buttons at the bottom of the screen "Scuttle Ship" in red and "Engage" in blue.
      * There should be a System Overrides group of checkboxes with the checkboxes: Invert Polarity, Dampen Inertia and Bypass Hydro-Compressor.
      * there should be a dropdown labelled "Warp Class"
      * The Scuttle Ship button should be to the left of the Engage button
      """
