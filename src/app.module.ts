import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorModule } from './monitor/monitor.module';
import {FirebaseModule} from "nestjs-firebase";

@Module({
  imports: [
      FirebaseModule.forRoot({
    googleApplicationCredential: "credential.json",
  }),
    MonitorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
