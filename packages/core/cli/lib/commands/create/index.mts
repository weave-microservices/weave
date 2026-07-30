import type { CreateCommandOptions } from "../../types.mts";
import middlewareHandler from "./middleware.mts";
import serviceHandler from "./service.mts";

export const handler = async (
  type: string,
  name: string,
  options: CreateCommandOptions,
): Promise<void> => {
  try {
    switch (type) {
      case "middleware":
        await middlewareHandler(name, options);
        break;
      case "service":
        await serviceHandler(name, options);
        break;
      case "project":
        break;
      default:
        console.error("Unknown template type.");
    }
  } catch (error) {
    console.error(error);
  }
};
