export const internalServices = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  unit: process.env.UNIT_SERVICE_URL || "http://localhost:5002",
  customer: process.env.CUSTOMER_SERVICE_URL || "http://localhost:5003",
}