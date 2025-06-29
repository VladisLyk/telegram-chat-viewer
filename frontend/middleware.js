import { NextResponse } from 'next/server';
import axios from 'axios';

export async function middleware(request) {
    const cookie = request.headers.get('cookie') || '';
    const currentPath = request.nextUrl.pathname;
    const origin = request.nextUrl.origin;

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const baseUrl = 'http://127.0.0.1:8000';

    if (!refreshToken) {
        if (currentPath.startsWith('/profile')) {
            return NextResponse.redirect(new URL('/', origin));
        }
        return NextResponse.next();
    }

    try {
        await axios.get(`${baseUrl}/auth/me`, {
            headers: {
                Cookie: cookie || '',
                Authorization: `Bearer ${accessToken || ''}`,
            },
            withCredentials: true,
        });
        return NextResponse.next();
    } catch (error) {
        const status = error.response?.status;
        if (status === 401 && refreshToken) {
            const refreshResult = await refreshTokenFunc(baseUrl, cookie);
            if (refreshResult.refreshed && refreshResult.access_token) {
                const response = NextResponse.next();
                response.cookies.set('access_token', refreshResult.access_token, {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'strict',
                });
                return response;
            }
        }
        if (currentPath.startsWith('/profile')) {
            return NextResponse.redirect(new URL('/', origin));
        }
        return NextResponse.next();
    }
}

async function refreshTokenFunc(baseUrl, cookie) {
    try {
        const response = await axios.post(`${baseUrl}/auth/refresh`, {}, {
            headers: {
                Cookie: cookie || '',
            },
            withCredentials: true,
        });
        return { refreshed: true, access_token: response.data.access_token };
    } catch (error) {
        return { refreshed: false };
    }
}

export const config = {
    matcher: ['/profile/:path*'],
};
