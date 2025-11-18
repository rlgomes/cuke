Feature: Docker steps
  As an automation engineer I want to be sure users can use the docker steps

  Scenario: User start a simple hello world docker container
    Given I kill the docker container "cuke-hello-world" if it exists
      And I remove the docker container "cuke-hello-world" if it exists
     Then I run the docker container "cuke-hello-world" with image "hello-world"
     Then I remove the docker container "cuke-hello-world"

  Scenario: User start an httpd container
    Given I kill and remove the docker container "cuke-httpd-test" if it exists
      And I run the docker container "cuke-httpd-test" with image "httpd:latest"
     Then I save the host port for the guest port "80" of the docker container "cuke-httpd-test" to the variable "HTTPD_WEB_PORT"
     When I open a browser at "http://localhost:${HTTPD_WEB_PORT}"
      And I wait to see the text "It works!"

  Scenario: User can run a command that takes 10s on a container
    Given I kill and remove the docker container "cuke-httpd-test" if it exists
      And I run the docker container "cuke-httpd-test" with image "httpd:latest"
     Then I exec "sleep 30" on the docker container "cuke-httpd-test"  
