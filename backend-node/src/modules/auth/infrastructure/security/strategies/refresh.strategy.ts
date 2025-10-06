import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'minha_chave_super_secreta', // mesma chave usada antes
    });
  }

  async validate(payload: any) {
    // Retorna os dados que vão ficar disponíveis em req.user
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}

