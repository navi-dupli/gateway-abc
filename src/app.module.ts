import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorModule } from './monitor/monitor.module';
import {FirebaseModule} from "nestjs-firebase";
import {OrquestadorModule} from "./orquestador/orquestador.module";

@Module({
  imports: [
      FirebaseModule.forRoot({
        googleApplicationCredential: "credential.json",
      }),
      MonitorModule,
      OrquestadorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
