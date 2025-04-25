# Managing Sensitive Keys in Local Development

This document explains how to manage sensitive keys (like API keys) in your local development environment without committing them to the repository.

## Problem

When developing locally, you need to use real API keys (like Stripe secret keys) for testing, but you don't want to commit these keys to the repository for security reasons.

## Solution

We've implemented a system that allows you to keep your sensitive keys in a local properties file that is not committed to git.

## How to Use

1. Copy the example file to create your local properties file:
   ```
   cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   ```

2. Edit the `application-local.properties` file and add your sensitive keys:
   ```
   # Stripe API key for local development
   stripe.secret-key=your_actual_stripe_secret_key_here
   ```

3. That's it! The application will automatically load your local properties file when it starts.

## How It Works

- The `.gitignore` file is configured to ignore `src/main/resources/application-local.properties`
- The `LocalPropertiesConfig` class loads this file if it exists
- Properties in `application-local.properties` override those in `application-dev.properties`
- If `application-local.properties` doesn't exist, the application falls back to `application-dev.properties`

## Best Practices

- Never commit sensitive keys to the repository
- Keep `application-local.properties` in your `.gitignore`
- Use environment variables in production environments
- Regularly rotate your API keys for security