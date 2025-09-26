import createError from "http-errors";

export const errorHandler = () => {
  return {
    onError: async (request) => {
      const error = request.error;

      if (createError.isHttpError(error)) {
        request.response = {
          statusCode: error.statusCode,
          body: JSON.stringify({
            error: error.name,
            message: error.message,
          }),
        };
      } else {
        request.response = {
          statusCode: 500,
          body: JSON.stringify({
            error: "Internal server error",
            message: "something went wrong",
            detail: error.message,
          }),
        };
      }
    },
  };
};
