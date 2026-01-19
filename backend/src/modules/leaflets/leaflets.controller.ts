import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import type { AuthedRequest } from '../auth/jwt.guard';
import { LeafletsService } from './leaflets.service';
import { CONFIG } from '../../config';
import * as QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@UseGuards(JwtGuard)
@Controller('leaflets')
export class LeafletsController {
  constructor(private readonly leaflets: LeafletsService) {}

  @Get('by-code/:code')
  async byCode(@Param('code') code: string) {
    return await this.leaflets.byCode(code);
  }

  @Post('by-code/:code/assign')
  async assign(
    @Param('code') code: string,
    @Body()
    body: { fullName?: string; phone?: string; rewardPerClient?: number; note?: string },
  ) {
    return await this.leaflets.assignByCode(code, {
      fullName: body.fullName ?? '',
      phone: body.phone ?? '',
      rewardPerClient: Number(body.rewardPerClient ?? 0),
      note: body.note,
    });
  }

  @Post('by-code/:code/reassign')
  async reassign(
    @Param('code') code: string,
    @Body()
    body: { fullName?: string; phone?: string; rewardPerClient?: number; note?: string },
  ) {
    return await this.leaflets.reassignByCode(code, {
      fullName: body.fullName ?? '',
      phone: body.phone ?? '',
      rewardPerClient: Number(body.rewardPerClient ?? 0),
      note: body.note,
    });
  }

  @Post('by-code/:code/activate')
  async activate(
    @Param('code') code: string,
    @Body() body: { note?: string },
    @Req() req: AuthedRequest,
  ) {
    const user = req.user!;
    return await this.leaflets.activateByCode(code, { note: body.note }, user.id);
  }

  @Get('by-code/:code/pdf')
  async pdf(@Param('code') code: string, @Res() res: Response) {
    const data = await this.leaflets.byCode(code);
    const publicCode = data.leaflet.publicCode;
    const url = `${CONFIG.frontendBaseUrl}/l/${encodeURIComponent(publicCode)}`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 10,
    });
    const pngBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    const pdfDoc = await PDFDocument.create();
    // A4 portrait in points
    const page = pdfDoc.addPage([595.28, 841.89]);

    // black background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      color: rgb(0, 0, 0),
    });

    const png = await pdfDoc.embedPng(pngBytes);
    const qrSize = 360;
    const qrX = (page.getWidth() - qrSize) / 2;
    const qrY = (page.getHeight() - qrSize) / 2;
    page.drawImage(png, { x: qrX, y: qrY, width: qrSize, height: qrSize });

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(`ID: ${publicCode}`, {
      x: 24,
      y: 24,
      size: 14,
      font,
      color: rgb(1, 1, 1),
    });

    const bytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="leaflet-${publicCode}.pdf"`);
    res.send(Buffer.from(bytes));
  }
}


