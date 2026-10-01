import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { UserSession } from '../../../entities/user-session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserSession) private readonly sessionRepo: Repository<UserSession>,
  ) {
    super({
      passReqToCallback: true,
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

  async validate(req: any, payload: any) {
    // Patient tokens are tied to a stored session so that logout takes effect immediately
    if (payload.role === 'Patient') {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      const session = token
        ? await this.sessionRepo.findOne({ where: { user: { id: payload.sub }, accessToken: token, isActive: true } })
        : null;
      if (!session) throw new UnauthorizedException();
    }
    return { id: payload.sub, userId: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
