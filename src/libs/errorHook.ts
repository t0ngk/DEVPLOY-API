import type { ZodError } from "zod";

export const errorHook = (
  result:
    | {
        success: false;
        error: ZodError;
      }
    | {
        success: true;
        data: any;
      },
  c: any
) => {
  if (!result.success) {
    const errorMessages = result.error.errors
      .map((error) => {
        const path = error.path.join(".");
        return path ? `${path}: ${error.message}` : error.message;
      })
      .join(", ");

    console.log(errorMessages);
    return c.json(
      {
        message: errorMessages,
      },
      400
    );
  }
};
