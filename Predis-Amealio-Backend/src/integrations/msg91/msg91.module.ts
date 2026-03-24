import { Module } from '@nestjs/common';
import { MSG91Service } from './msg91.service';

@Module({
  providers: [MSG91Service],
  exports: [MSG91Service],
  
})
export class MSG91Module {}


