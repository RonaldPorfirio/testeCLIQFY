import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface StoredUser {
    id: number;
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'agent' | 'viewer';
    password: string;
}

export interface AuthenticatedUser {
    id: number;
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'agent' | 'viewer';
}

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    // Usuários simulados
    private users: StoredUser[] = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            password: '$2b$10$HLUJgZORA5zPpTL6FcmaUe0RhyRj5gyNinLg59yGO8jjaudN0Jgla',
        },
        {
            id: 2,
            username: 'agent',
            email: 'agent@example.com',
            name: 'Field Agent',
            role: 'agent',
            password: '$2b$10$QprpVZfURYNd1UIzV7Ap3u52itfR9xwFfpO9EzqFryIB91kTQaQZu',
        },
        {
            id: 3,
            username: 'viewer',
            email: 'viewer@example.com',
            name: 'Viewer User',
            role: 'viewer',
            password: '$2b$10$CFgIEf0KHj9wNphuLJI1DOnLCbDMdcLuBgS4Kd.Olajm./zjMMxVm',
        },
    ];

    private sanitizeUser(user: StoredUser): AuthenticatedUser {
        const { password, ...rest } = user;
        return rest;
    }

    async validateUser(login: string, pass: string): Promise<AuthenticatedUser | null> {
        const normalizedLogin = login?.toLowerCase();
        const user = this.users.find(
            (u) => u.username.toLowerCase() === normalizedLogin || u.email.toLowerCase() === normalizedLogin,
        );

        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(pass, user.password);
        if (!isValid) {
            return null;
        }

        return this.sanitizeUser(user);
    }

    async login(user: AuthenticatedUser) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        return {
            user,
            token: this.jwtService.sign(payload, { expiresIn: '15m' }),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }

    async refresh(user: { userId: number; username: string; role: string; email?: string; name?: string }) {
        const stored = this.users.find((u) => u.id === user.userId);
        if (!stored) {
            return null;
        }

        const sanitized = this.sanitizeUser(stored);
        const payload = {
            sub: sanitized.id,
            username: sanitized.username,
            email: sanitized.email,
            name: sanitized.name,
            role: sanitized.role,
        };

        return {
            user: sanitized,
            token: this.jwtService.sign(payload, { expiresIn: '15m' }),
        };
    }

    getUserById(id: number): AuthenticatedUser | null {
        const user = this.users.find((u) => u.id === id);
        return user ? this.sanitizeUser(user) : null;
    }
}
