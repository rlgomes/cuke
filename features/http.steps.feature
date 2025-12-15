Feature: HTTP steps
  As an automation engineer I want to be sure users can use the HTTP steps

  Scenario: User can hit a simple HTTP server with GET requests
    Given I kill and remove the container "http-steps-container" if it exists
      And I run the container "http-steps-container" with image "docker.io/library/httpd:latest"
     Then I save the host port for the guest port "80" of the container "http-steps-container" to the variable "PORT"
     When I send an HTTP "GET" to the URL "http://localhost:${PORT}"
     Then I should see that "${result.body}" contains "It works!"
      And I kill and remove the container "http-steps-container"

  Scenario: User can send HTTP request with data
    Given I kill and remove the container "http-steps-container" if it exists
      And I run the container "http-steps-container" with image "docker.io/kennethreitz/httpbin"
     Then I save the host port for the guest port "80" of the container "http-steps-container" to the variable "PORT"
      And I wait for an HTTP "GET" to the URL "http://localhost:${PORT}/get" to respond with status code "200"
     When I send an HTTP "POST" to the URL "http://localhost:${PORT}/post" with the following data:
      """
      testing! 
      """
     Then I should see that "${result.body}" contains "testing!"
      And I kill and remove the container "http-steps-container"

  Scenario: User can send HTTP request with headers and data
    Given I kill and remove the container "http-steps-container" if it exists
      And I run the container "http-steps-container" with image "docker.io/kennethreitz/httpbin"
     Then I save the host port for the guest port "80" of the container "http-steps-container" to the variable "PORT"
      And I wait for an HTTP "GET" to the URL "http://localhost:${PORT}/get" to respond with status code "200"
      When I send an HTTP "POST" to the URL "http://localhost:${PORT}/post" with headers "foo: bar" and the following data:
      """
      testing! 
      """
     Then I should see that "${result.body}" contains "testing!"
     # httpbin container responds in the body with the headers that were sent
      And I should see that "${result.body}" contains "Foo"
      And I kill and remove the container "http-steps-container"
