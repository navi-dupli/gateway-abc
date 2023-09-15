import { Module } from '@nestjs/common';
import { MonitorController } from './monitor.controller';
import {FirebaseModule} from "nestjs-firebase";

@Module({
  imports: [],
  controllers: [MonitorController]
})
export class MonitorModule {}
