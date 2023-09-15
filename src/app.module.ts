import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorModule } from './monitor/monitor.module';
import {FirebaseModule} from "nestjs-firebase";

@Module({
  imports: [
      FirebaseModule.forRoot({
    googleApplicationCredential: "proyecto-final-xcloud-firebase-adminsdk-yni8p-48600f3b4e.json",
  }),
    MonitorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
