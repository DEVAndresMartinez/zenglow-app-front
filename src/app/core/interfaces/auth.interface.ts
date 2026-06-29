export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface RecoverRequest {
  useremail: string;
  username: string;
}

export interface RecoverResponse {
  statusCode: number;
  message: string;
  code: string;
}

export interface ChangePasswordRequest {
  newpassword: string;
}


