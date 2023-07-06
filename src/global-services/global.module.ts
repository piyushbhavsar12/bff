import { Module } from '@nestjs/common';

//Singleton pattern - https://stackoverflow.com/questions/60192912/how-to-create-a-service-that-acts-as-a-singleton-with-nestjs
@Module({
  providers: [],
  exports: [],
})
export class CommonServiceModule {
}