import { ApiResponse, LoginRequest, LoginResponse } from './types';
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    get<T>(endpoint: string): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>>;
    login(request: LoginRequest): Promise<LoginResponse | {
        success: false;
        error: string;
    }>;
}
export declare const apiClient: ApiClient;
