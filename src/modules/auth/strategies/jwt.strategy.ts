import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtStrategy.requireSecret(configService),
    });
  }

  static requireSecret(configService: ConfigService): string {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET must be set');
    return secret;
  }

  async validate(payload: any) {
    return { id: payload.sub, userId: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
