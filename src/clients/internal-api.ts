// backends/common/src/clients/internal-api.ts
import axios, { type AxiosInstance } from 'axios'

export class InternalApiClient {
  private client: AxiosInstance

  constructor(baseURL: string, serviceName: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': serviceName,
        'X-Internal-Request': 'true'
      }
    })

    // Add service-to-service authentication
    this.client.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
      return config
    })

    // Add retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status >= 500 && error.config.retryCount < 3) {
          error.config.retryCount = (error.config.retryCount || 0) + 1
          await new Promise(resolve => setTimeout(resolve, 1000))
          return this.client.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get(url)
    return response.data
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post(url, data)
    return response.data
  }
}