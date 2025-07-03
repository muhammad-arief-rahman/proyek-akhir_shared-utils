export type APIResponse<T> = {
  status: number;
  message: string;
  data: T;

  [key: string]: any; // Allow additional properties
};

export type APIError = {
  status: number;
  message: string;
  error: any;

  [key: string]: any; // Allow additional properties
};
