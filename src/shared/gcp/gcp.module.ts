import { Logger, Module } from "@nestjs/common";

import { StorageService } from "./services/storage.service";

@Module({
  providers: [StorageService, Logger],
  exports: [StorageService],
})
export class GcpModule {}
