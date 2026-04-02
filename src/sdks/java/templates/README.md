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
