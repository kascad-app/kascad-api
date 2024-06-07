import { APIError, StatusCode } from "@kascad-app/shared-types";
import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequest extends HttpException {
  constructor(message: string, errors?: { [key: string]: string }) {
    const response: APIError = {
      success: false,
      message: message,
      statusCode: StatusCode.ClientErrorBadRequest,
      errors: errors,
    };
    super(response, HttpStatus.BAD_REQUEST);
  }
}
