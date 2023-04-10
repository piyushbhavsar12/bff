import { Module } from '@nestjs/common';
import { ConfigParserService } from './config-parser.service';

@Module({
  providers: [ConfigParserService]
})
export class ConfigParserModule {}
