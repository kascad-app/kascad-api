import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from "@nestjs/mongoose";

import { Connection } from "mongoose";

@Injectable()
export class MongoDBConfigService implements MongooseOptionsFactory {
  private readonly logger = new Logger(MongoDBConfigService.name);

  constructor(private readonly _configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const dsn: string = this.buildDsn(
      this._configService.get("MONGODB_METHOD"),
      this._configService.get("MONGODB_USERNAME"),
      this._configService.get("MONGODB_PASSWORD"),
      this._configService.get("MONGODB_SERVER_URI"),
      this._configService.get("MONGODB_DATABASE"),
      this._configService.get("MONGODB_PARAMS") || "",
    );
    this.logger.debug(`Generated DSN : ${dsn}`);

    return {
      uri: dsn,
      connectionFactory: async (connection: Connection) => {
        return connection;
      },
    };
  }

  private buildDsn(
    method: string,
    username: string,
    password: string,
    serverUri: string,
    databaseName: string,
    params: string,
  ): string {
    const paramsArray = params.split(",");
    params =
      paramsArray && paramsArray.length > 0 ? params.split(",").toString() : "";

    if (method.includes("srv")) {
      return `${method}://${username}:${password}@${serverUri}/${databaseName}${params}`;
    }

    return `${method}://${serverUri}/${databaseName}${params}`;
  }
}
