@browser
Feature: Browser management
  As an automation engineer I want the browser management steps to work as
  expected when doing various operations with browser windows

  Scenario: User can open and close a browser
    Given I open a browser at "https://www.google.com"
     Then I close the current browser

  Scenario: User can refresh the current page
    Given I open a browser at "file:///${PWD}/data/browser.html"
      And I should see the text "This page has been loaded **1** times."
     When I refresh the current page
     Then I should see the text "This page has been loaded **2** times."

  Scenario: User can navigate to a different URL
    Given I open a browser at "file:///${PWD}/data/browser.html"
      And I should see the text "This page has been loaded **1** times."
     When I navigate to "file:///${PWD}/data/text.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/text.html"
      And I should see the text "some text in a header"

  Scenario: User can verify the current URL
    Given I open a browser at "file:///${PWD}/data/browser.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/browser.html"

  Scenario: User can wait for the browser URL to become equal to a value
    Given I open a browser at "file:///${PWD}/data/browser_url_change.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/browser.html"

  Scenario: User can open a new tab
    Given I open a browser at "file:///${PWD}/data/browser.html"
     When I open a new tab
     Then I should see the browser URL is equal to "about:blank"

  Scenario: User can open a new tab with a URL
    Given I open a browser at "file:///${PWD}/data/browser.html"
     When I open a new tab at "file:///${PWD}/data/text.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/text.html"

  Scenario: User can switch between tabs
    Given I open a browser at "file:///${PWD}/data/browser.html"
      And I open a new tab at "file:///${PWD}/data/text.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/text.html"
     When I switch to the previous tab
     Then I should see the browser URL is equal to "file://${PWD}/data/browser.html"
     When I switch to the next tab
     Then I should see the browser URL is equal to "file://${PWD}/data/text.html"

  Scenario: User can close a tab
    Given I open a browser at "file:///${PWD}/data/browser.html"
      And I open a new tab at "file:///${PWD}/data/text.html"
     Then I should see the browser URL is equal to "file://${PWD}/data/text.html"
     When I close the current tab
     Then I should see the browser URL is equal to "file://${PWD}/data/browser.html"
