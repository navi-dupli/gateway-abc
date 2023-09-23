import { Module } from '@nestjs/common';
import {OrquestadorController} from "./orquestador.controller";

@Module({
    imports: [],
    controllers: [OrquestadorController],
    providers: [],
})
export class OrquestadorModule {}