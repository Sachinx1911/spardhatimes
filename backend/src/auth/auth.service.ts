import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { normalizePhone } from './phone';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  /** refresh token ओळखण्यासाठी — access token मध्ये हे नसतं. */
  typ?: 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  /**
   * विद्यार्थ्याचं login.
   *
   * चूक कुठेही असो — क्रमांक सापडला नाही, password चुकला, किंवा खातं अडवलेलं आहे —
   * उत्तर **एकच** ठेवलं आहे. वेगवेगळी उत्तरं दिली तर कोणता क्रमांक नोंदलेला आहे
   * हे बाहेरून ओळखता येतं.
   */
  async login(rawPhone: string, password: string): Promise<TokenPair> {
    const phone = normalizePhone(rawPhone);
    if (!phone) throw new UnauthorizedException('मोबाइल क्रमांक किंवा password चुकीचा आहे.');

    const user = await this.prisma.client.user.findUnique({
      where: { phone },
      select: { id: true, role: true, passwordHash: true, isBlocked: true },
    });

    // User सापडला नाही तरी bcrypt चालवायचा — नाहीतर उत्तर किती वेळात आलं यावरून
    // क्रमांक नोंदलेला आहे की नाही हे कळतं.
    const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
    const ok = await compare(password, hash);

    if (!user || !ok || user.isBlocked) {
      throw new UnauthorizedException('मोबाइल क्रमांक किंवा password चुकीचा आहे.');
    }

    return this.issueTokens(user.id, user.role);
  }

  /**
   * Refresh token देऊन नवीन जोडी घेणे.
   *
   * Token मधली भूमिका पुन्हा वापरत नाही — database मधून ताजी घेतो. म्हणजे admin ने
   * विद्यार्थ्याला अडवलं किंवा भूमिका बदलली तर पुढच्या refresh ला ते लागू होतं.
   */
  async refresh(token: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Session संपली आहे. पुन्हा login करा.');
    }

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Session संपली आहे. पुन्हा login करा.');
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isBlocked: true },
    });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Session संपली आहे. पुन्हा login करा.');
    }

    return this.issueTokens(user.id, user.role);
  }

  async me(userId: string) {
    return this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  private async issueTokens(sub: string, role: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      // Access token छोटा — चोरीला गेला तरी फार वेळ चालू नये.
      this.jwt.signAsync({ sub, role }, { expiresIn: '15m' }),
      this.jwt.signAsync({ sub, role, typ: 'refresh' }, { expiresIn: '60d' }),
    ]);
    return { accessToken, refreshToken };
  }
}
