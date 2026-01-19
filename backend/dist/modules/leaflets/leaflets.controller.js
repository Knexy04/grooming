"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const leaflets_service_1 = require("./leaflets.service");
const config_1 = require("../../config");
const QRCode = require("qrcode");
const pdf_lib_1 = require("pdf-lib");
let LeafletsController = class LeafletsController {
    constructor(leaflets) {
        this.leaflets = leaflets;
    }
    async byCode(code) {
        return await this.leaflets.byCode(code);
    }
    async assign(code, body) {
        return await this.leaflets.assignByCode(code, {
            fullName: body.fullName ?? '',
            phone: body.phone ?? '',
            rewardPerClient: Number(body.rewardPerClient ?? 0),
            note: body.note,
        });
    }
    async reassign(code, body) {
        return await this.leaflets.reassignByCode(code, {
            fullName: body.fullName ?? '',
            phone: body.phone ?? '',
            rewardPerClient: Number(body.rewardPerClient ?? 0),
            note: body.note,
        });
    }
    async activate(code, body, req) {
        const user = req.user;
        return await this.leaflets.activateByCode(code, { note: body.note }, user.id);
    }
    async pdf(code, res) {
        const data = await this.leaflets.byCode(code);
        const publicCode = data.leaflet.publicCode;
        const url = `${config_1.CONFIG.frontendBaseUrl}/l/${encodeURIComponent(publicCode)}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'M',
            margin: 1,
            scale: 10,
        });
        const pngBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);
        page.drawRectangle({
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        const png = await pdfDoc.embedPng(pngBytes);
        const qrSize = 360;
        const qrX = (page.getWidth() - qrSize) / 2;
        const qrY = (page.getHeight() - qrSize) / 2;
        page.drawImage(png, { x: qrX, y: qrY, width: qrSize, height: qrSize });
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        page.drawText(`ID: ${publicCode}`, {
            x: 24,
            y: 24,
            size: 14,
            font,
            color: (0, pdf_lib_1.rgb)(1, 1, 1),
        });
        const bytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="leaflet-${publicCode}.pdf"`);
        res.send(Buffer.from(bytes));
    }
};
exports.LeafletsController = LeafletsController;
__decorate([
    (0, common_1.Get)('by-code/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeafletsController.prototype, "byCode", null);
__decorate([
    (0, common_1.Post)('by-code/:code/assign'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeafletsController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('by-code/:code/reassign'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeafletsController.prototype, "reassign", null);
__decorate([
    (0, common_1.Post)('by-code/:code/activate'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeafletsController.prototype, "activate", null);
__decorate([
    (0, common_1.Get)('by-code/:code/pdf'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeafletsController.prototype, "pdf", null);
exports.LeafletsController = LeafletsController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Controller)('leaflets'),
    __metadata("design:paramtypes", [leaflets_service_1.LeafletsService])
], LeafletsController);
//# sourceMappingURL=leaflets.controller.js.map