# template-api

## Introduction

This repository handles thes the creation of the AWS API gateway and the backend lambda code. 
- API Gateway
- Lambda Layers
- Lambda Functions

**Note: please see the template-aws-infrastructure before using this**

## Directory Structure

The project directory structure has the following directories. 
File / Directory | Description
-----------------|-------------
__ tests __ | directory  contains all the jest tests for this repository.
events | This directory contains the event files which are used to test the lambda functions locally.
.env | This file contains the connectivity details for the local database etc for the jest tests.
env.json | This contains the connectivity details for the lambda function when run via the api gateway locally.
lambda | The lambda directory contains all the lambda functions code for the project.
layers | This directory contains a sub directory for each of the layers.

**tests**

The contains all the tests which can be run as follows

npm run test

**events**

This contains common events that you can manually run against a lambda function. An example of an event is shown below.

{
    "httpMethod": "POST",
    "body": "{\"email\": \"dave@har.com\", \"username\": \"Dave123\",\"password\": \"London01\",\"password2\": \"London01\",\"type\": \"1\"}"
}

To test a function with the above event in a file "events/event.json" then run the below command.
sam local invoke "userAccountMaintenanceTest" -e events/event.json

**lambdas**

Underneath the lambda function in the handlers directory all the code for the lambda functions exist (apart from the layer code they use).

**layers**

The layers directory contains a sub directory for each of the layers.

**.env**

This file isnt included in the repository. It exists at the root level and looks as follow.

DB_HOST=<Host name or IP for the database server>
DB_USER=<Username for the database>
DB_PASSWORD=<Password for database>
DB_DATABASE=<Database Name>
DB_PORT=<Database Port>
JWT_SECRET=<Random Letters to create a secret>

**.env.json**

This file is used when we run the lambda functions either locally with there event file or locally via the api gateway sam creates. Each lambda function will need its connection details defined.

{
    "userAccountMaintenance": {
        "DB_HOST":     "<Host name or IP for the database server>",
        "DB_USER":     "<Username for the database>",
        "DB_PASSWORD": "<Password for database>",
        "DB_DATABASE": "<Database Name>",
        "DB_PORT":     "<Database Port>",
        "JWT_SECRET":  "<Random Letters to create a secret>"
    },
    "userAuthentication": {
        "DB_HOST":     "<Host name or IP for the database server>",
        "DB_USER":     "<Username for the database>",
        "DB_PASSWORD": "<Password for database>",
        "DB_DATABASE": "<Database Name>",
        "DB_PORT":     "<Database Port>",
        "JWT_SECRET":  "<Random Letters to create a secret>"
    }
  }


## Package and Deployment

To package and deploy we use SAM. We package to an S3 bucket this converts the SAM template to cloudformation) and then we deploy this file. 

sam package --s3-bucket df-apps --output-template-file out.yml


## Packaging and Deploying

To package and deploy via sam you run the following commands.

To package the this up
sam package --s3-bucket df-apps --output-template-file out.yml

To deploy this code
sam deploy --template-file out.yml --region <Region> --capabilities CAPABILITY_IAM --stack-name <Stack name>

Package and deployment can be handled via cloudformation, seen below. I like the simplicity of the sam deployment.
> aws s3 mb s3://${BUCKET}
aws cloudformation package --template-file template.yml --s3-bucket sharemytutoring-sam --output-template template-export.yml
aws cloudformation deploy  --template-file template-export.yml --stack-name sharemytutoring --capabilities CAPABILITY_IAM

## Testing

This repository has a test folder __test__ in the root directory. This contains all the unit and integration tests for the backend functionality. To run the tests run the following command

npm run test

## Local Run

In order to develop you will need to run both the react and backend on your PC whilst you develop. To run the backend locally you run the below command, although you will need to upload the layers first (SAM can only extract the layers from AWS and not read from your local PC or repository). React and the local gateway run on the same port, so to get them running together you will need to change the port one of them runs on. Below it is set to run on port 3002.

sam local start-api --env-vars env.json --port 3002

Each of the functions needs to have its environment variables set. This is done in the env.json file.

To run one lambda function at a time.

sam local invoke "HelloWorldFunction" -e events/event.json


## Lambda Functions 

In you want to run the lambda functions from the AWS console you will need to enter the parameters required for each of the functions

{
    "httpMethod": "POST",
    "body": "{\"email\": \"dave@har.com\", \"username\": \"Dave123\",\"password\": \"London01\",\"password2\": \"London01\",\"type\": \"1\"}"
}

sam local start-api --env-vars env.json --port 3002


