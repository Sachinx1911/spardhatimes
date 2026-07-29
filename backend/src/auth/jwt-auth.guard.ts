import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import type { JwtPayload } from './auth.service';

export const IS_PUBLIC = 'isPublic';

/** Login सारख्या मार्गांवर लावायचा — बाकी सगळे मार्ग आपोआप बंद. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export interface AuthedRequest extends Request {
  user: { id: string; role: string };
}

/**
 * हा guard `APP_GUARD` म्हणून लावला आहे, म्हणजे **प्रत्येक** मार्ग आपोआप संरक्षित
 * आहे आणि उघडा ठेवायचा असेल तरच `@Public()` लिहावं लागतं. उलटं केलं — म्हणजे
 * प्रत्येक controller वर guard लावायचा — तर एखादा नवीन मार्ग विसरला की तो उघडा
 * राहतो आणि ते कोणाच्या लक्षातही येत नाही.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Login आवश्यक आहे.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Session संपली आहे. पुन्हा login करा.');
    }

    // Refresh token ने सामान्य API वापरता येऊ नये — तो फक्त /auth/refresh साठी.
    if (payload.typ === 'refresh') {
      throw new UnauthorizedException('Login आवश्यक आहे.');
    }

    req.user = { id: payload.sub, role: payload.role };
    return true;
  }
}
