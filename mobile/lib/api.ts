import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function sanitizeBaseUrl(url: string) {
    return url.replace(/\/+$/, '');
}

function extractHost(rawHost?: string | null) {
    if (!rawHost) return null;

    const normalized = rawHost.includes('://') ? rawHost.replace('exp://', 'http://') : `http://${rawHost}`;

    try {
        return new URL(normalized).hostname;
    } catch {
        const [host] = rawHost.replace('exp://', '').split(':');
        return host || null;
    }
}

function resolveApiBaseUrl() {
    const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (envUrl) {
        return sanitizeBaseUrl(envUrl);
    }

    const host =
        extractHost(Constants.expoConfig?.hostUri) ||
        extractHost((Constants as any).expoGoConfig?.debuggerHost) ||
        extractHost((Constants as any).expoGoConfig?.hostUri);

    if (host) {
        return `http://${host}:5000/api`;
    }

    return 'http://localhost:5000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

const buildUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

async function getToken() {
    return AsyncStorage.getItem('accessToken');
}

async function getRefreshToken() {
    return AsyncStorage.getItem('refreshToken');
}

async function refreshAccessToken() {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
        const res = await fetch(buildUrl('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const accessToken = data.accessToken ?? data.token;
        if (!accessToken) return null;

        await AsyncStorage.setItem('accessToken', accessToken);
        if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
        }

        return accessToken;
    } catch {
        return null;
    }
}

async function request(path: string, options: RequestInit = {}) {
    let token = await getToken();

    const makeRequest = (authToken?: string) =>
        fetch(buildUrl(path), {
            ...options,
            headers: {
                ...(options.headers || {}),
                'Content-Type': 'application/json',
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
        });

    try {
        const res = await makeRequest(token || undefined);

        if (res.status === 401) {
            token = await refreshAccessToken();
            if (token) {
                return makeRequest(token);
            }
        }

        return res;
    } catch (error) {
        throw error;
    }
}

export const api = {
    get: (path: string) => request(path, { method: 'GET' }),
    post: (path: string, body: any) =>
        request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path: string, body: any) =>
        request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path: string) => request(path, { method: 'DELETE' }),
};