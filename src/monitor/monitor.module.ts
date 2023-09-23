import { Module } from '@nestjs/common';
import { MonitorController } from './monitor.controller';
import {FirebaseModule} from "nestjs-firebase";
import {MonitorTask} from "./monitorTask";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot(),],
  controllers: [MonitorController],
  providers: [MonitorTask],
})
export class MonitorModule {}
