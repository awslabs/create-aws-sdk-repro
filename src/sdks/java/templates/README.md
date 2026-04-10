# AWS Java SDK Repro Project

Service: {{service}}  
Operation: {{operation}}  
Region: {{region}}

## Prerequisites

Configure AWS credentials using the AWS CLI:

```bash
aws configure
```

This stores credentials securely in `~/.aws/credentials`. For production environments, use IAM roles attached to EC2 instances or ECS tasks instead of long-term credentials.

## Build and Run

```bash
mvn clean compile exec:java
```

## Verifying the Setup

After running the project, you should see the operation response printed to the console. If you encounter errors, verify your credentials with `aws sts get-caller-identity` and confirm the region is correct.

## Cleanup

If the operation created AWS resources during testing, delete them to avoid ongoing charges. Review the AWS Console for the service you tested and remove any resources that are no longer needed.

## About

This project provides a minimal reproduction environment for testing AWS Java SDK operations. Use this template to isolate and report SDK issues or validate your AWS service configurations.
