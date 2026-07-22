import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @Request() req: { user: { userId: string; email: string; role: string } },
  ) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // bu sira bilerek ayarlanir
  @Roles('OWNER')
  @Get('owner-only')
  ownerOnly(
    @Request() req: { user: { userId: string; email: string; role: string } },
  ) {
    return { message: 'You are an OWNER, welcome.', user: req.user };
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  google() {

  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(
    @Request() req: { user: { email: string; name: string } },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.validateOAuthLogin(req.user);
    const frontendUrl = `http://localhost:3000/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(frontendUrl);
  }
}
