import type { CreateCommandOptions } from "../../types.mts";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import ejs from "ejs";
import kleur from "kleur";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (serviceName: string, options: CreateCommandOptions): Promise<void> => {
  const { serviceFolder } = await inquirer.prompt([
    {
      type: "input",
      name: "serviceFolder",
      message: "Service directory",
      default: "./services",
      validate(input: string) {
        if (!fs.existsSync(path.resolve(input))) {
          return `The '${input}' directory is not exists! Full path: ${path.resolve(input)}`;
        }

        return true;
      },
    },
  ]);

  const suffix = options.suffix ? options.suffix : "service";

  const newServicePath = path.join(serviceFolder, `${serviceName}.${suffix}.js`);

  ejs.renderFile(
    path.join(__dirname, "templates", "service.ejs"),
    { serviceName },
    null,
    function (error: Error | null, result?: string) {
      if (error) {
        throw error;
      }

      if (result === undefined) {
        throw new Error("Template rendering returned no content.");
      }

      console.log(`✨ Writing file in ${kleur.yellow(newServicePath)}`);
      fs.writeFileSync(path.resolve(newServicePath), result, "utf8");
    },
  );
};
