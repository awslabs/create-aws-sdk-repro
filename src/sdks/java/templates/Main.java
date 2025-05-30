package com.aws.repro;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.{{service}}.{{Service}}Client;
import software.amazon.awssdk.services.{{service}}.model.{{Operation}}Request;
import software.amazon.awssdk.services.{{service}}.model.{{Operation}}Response;
public class Main {
    public static void main(String[] args) {
        {{Service}}Client client = {{Service}}Client.builder()
            .region(Region.{{region}})
            .build();
        {{Operation}}Request request = {{Operation}}Request.builder()
            // Configure request parameters here
            .build();
        try {
            {{Operation}}Response response = client.{{operation}}(request);
            System.out.println("Operation successful:");
            System.out.println(response);
        } catch (Exception e) {
            System.err.println("Error executing operation:");
            e.printStackTrace();
            System.exit(1);
        }
    }
}