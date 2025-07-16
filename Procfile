[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/test"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
variables = { NODE_ENV = "production" }

[environments.development]
variables = { NODE_ENV = "development" }
