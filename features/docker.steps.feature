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

  Scenario: User can run a container with specific port mappings
    Given I kill and remove the docker container "cuke-nginx-test" if it exists
      And I run the docker container "cuke-nginx-test" with image "nginx:latest", ports "8080:80"
     Then I save the host port for the guest port "80" of the docker container "cuke-nginx-test" to the variable "NGINX_PORT"
     When I should see that "${NGINX_PORT}" is equal to "8080"
     Then I kill and remove the docker container "cuke-nginx-test" if it exists

  Scenario: User can run a command on a docker image
    Given I run "echo hello world" on the docker image "alpine:latest"

  Scenario: User can run a command on a docker image with volume
    Given I run "ls -la /data" on the docker image "alpine:latest" with volume "${PWD}:/data"

  Scenario: User can kill a docker container directly
    Given I kill and remove the docker container "cuke-kill-test" if it exists
      And I run the docker container "cuke-kill-test" with image "httpd:latest"
     Then I kill the docker container "cuke-kill-test"
     Then I remove the docker container "cuke-kill-test"

  Scenario: User can exec a command and wait for specific exit code
    Given I kill and remove the docker container "cuke-exit-test" if it exists
      And I run the docker container "cuke-exit-test" with image "httpd:latest"
     Then I exec "ls" on the docker container "cuke-exit-test" and wait for exit code "0"
     Then I kill and remove the docker container "cuke-exit-test" if it exists

  Scenario: User can run a multiline command on a docker container
    Given I kill and remove the docker container "cuke-multiline-test" if it exists
      And I run the docker container "cuke-multiline-test" with image "httpd:latest"
     Then I run the following command on the docker container "cuke-multiline-test":
      """
      sh -c "echo 'line 1' && echo 'line 2'"
      """
     Then I kill and remove the docker container "cuke-multiline-test" if it exists

  Scenario: User can create a docker network if it does not exist
    Given I create the docker network "cuke-test-network" if it does not exist
     Then I create the docker network "cuke-test-network" if it does not exist

  Scenario: User can connect a container to a network
    Given I kill and remove the docker container "cuke-network-test" if it exists
      And I create the docker network "cuke-network-test" if it does not exist
      And I run the docker container "cuke-network-test" with image "alpine:latest"
     Then I connect the docker container "cuke-network-test" to the network "cuke-network-test"
     Then I kill and remove the docker container "cuke-network-test" if it exists

  Scenario: User can exec a command and wait for stdout to contain text
    Given I kill and remove the docker container "cuke-contains-test" if it exists
      And I run the docker container "cuke-contains-test" with image "httpd:latest"
     Then I exec "echo 'hello world'" on the docker container "cuke-contains-test" and wait for stdout to contain "hello"
     Then I kill and remove the docker container "cuke-contains-test" if it exists

  Scenario: User can exec a command and wait for stdout to match pattern
    Given I kill and remove the docker container "cuke-match-test" if it exists
      And I run the docker container "cuke-match-test" with image "httpd:latest"
     Then I exec "echo 'test123'" on the docker container "cuke-match-test" and wait for stdout to match the following:
      """
      test\\d+
      """
     Then I kill and remove the docker container "cuke-match-test" if it exists

  Scenario: User can exec a command and save stdout to a variable
    Given I kill and remove the docker container "cuke-save-test" if it exists
      And I run the docker container "cuke-save-test" with image "httpd:latest"
     Then I exec "echo 'saved output'" on the docker container "cuke-save-test" and save stdout to the variable "SAVED_OUTPUT"
     When I should see that "${SAVED_OUTPUT}" contains "saved output"
     Then I kill and remove the docker container "cuke-save-test" if it exists  
