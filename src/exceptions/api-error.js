const { HTTP_STATUS } = require("../constants/http-status.constants");

module.exports = class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message = "Bad request", errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static UnauthorizedError(message = "User is not authorized") {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static Forbidden(message = "Access denied") {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static NotFound(message = "Resource not found") {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static Conflict(message = "Resource conflict") {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static ValidationError(message = "Validation failed", errors = []) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static TooManyRequests(message = "Too many requests") {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static InternalServerError(message = "Internal server error") {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }

  static ServiceUnavailable(message = "Service unavailable") {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message);
  }
};
