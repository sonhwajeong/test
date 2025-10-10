"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = void 0;
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            const data = await response.json();
            return { success: response.ok, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async post(endpoint, body) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            return { success: response.ok, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async login(request) {
        try {
            // 디버깅용 로그
            console.log('로그인 시도 중...', { url: `${this.baseUrl}/auth/login`, data: request });
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            console.log('응답 받음!', { status: response.status, statusText: response.statusText });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('서버 오류 응답:', errorData);
                return { success: false, error: errorData?.message || 'Login failed' };
            }
            const data = await response.json();
            console.log('로그인 성공!', data);
            return data;
        }
        catch (error) {
            console.error('네트워크 오류 발생:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Network error' };
        }
    }
}
exports.ApiClient = ApiClient;
exports.apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://172.16.2.84:8080');
