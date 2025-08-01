import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World! and welcome to the Kascad API (et lucas le master dev france cherche un CDI très très bien payé)";
  }
}
