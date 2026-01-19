"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const leaflets_controller_1 = require("./leaflets.controller");
const leaflets_service_1 = require("./leaflets.service");
let LeafletsModule = class LeafletsModule {
};
exports.LeafletsModule = LeafletsModule;
exports.LeafletsModule = LeafletsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [leaflets_controller_1.LeafletsController],
        providers: [leaflets_service_1.LeafletsService],
    })
], LeafletsModule);
//# sourceMappingURL=leaflets.module.js.map