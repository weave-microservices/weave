import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ejs from 'ejs';
import kleur from 'kleur';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const groupedMiddlewareFunctions = [
  {
    groupName: 'Broker lifecycle hooks',
    hooks: [
      'created',
      'started',
      'stopping',
      'stopped',
      'createService',
      'loadService',
      'loadServices'
    ]
  },
  {
    groupName: 'Broker method hooks',
    hooks: [
      'ping',
      'call',
      'multiCall',
      'emit',
      'broadcast',
      'broadcastLocal'
    ]
  },
  {
    groupName: 'Service hooks',
    hooks: [
      'serviceCreating',
      'serviceCreated',
      'serviceStopping',
      'serviceStopped'
    ]
  },
  {
    groupName: 'Service action/event hooks',
    hooks: [
      'localAction',
      'localEvent',
      'remoteAction',
      'remoteEvent'
    ]
  },
  {
    groupName: 'Transport hooks',
    hooks: [
      'transportSend',
      'transportMessageHandler'
    ]
  }

];

export default async (middlewareName: string, options: any): Promise<void> => {
  const { middlewareFolder } = await inquirer.prompt([
    {
      type: 'input',
      name: 'middlewareFolder',
      message: 'Where should the middleware be stored?',
      default: './',
      async validate(input: string) {
        if (!fs.existsSync(path.resolve(input))) {
          return `The '${input}' directory is not exists! Full path: ${path.resolve(input)}`;
        }

        return true;
      }
    }
  ]);

  const { customizeOutput } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'customizeOutput',
      message: 'Do you want to customize the output?',
      default: false
    }
  ]);

  let middlewareFunctions = groupedMiddlewareFunctions.map((group) => group.hooks).flat();

  if (customizeOutput) {
    const result = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'middlewareFunctions',
        choices: groupedMiddlewareFunctions.map((group) => {
          return [new inquirer.Separator(group.groupName), ...group.hooks];
        }).flat(),
        message: 'Do you want to customize the output?'
      }
    ]);

    middlewareFunctions = result.middlewareFunctions;
  }

  const suffix = options.suffix ? options.suffix : 'middleware';

  const newMiddlewarePath = path.join(middlewareFolder, `${middlewareName}.${suffix}.js`);

  const data = {
    middlewareName,
    middlewareFunctions
  };

  ejs.renderFile(path.join(__dirname, 'templates', 'middleware.ejs'), data, null, function (error, result) {
    if (error) {
      throw error;
    }

    console.log(`✨ Writing file in ${kleur.yellow(newMiddlewarePath)}`);
    fs.writeFileSync(path.resolve(newMiddlewarePath), result, 'utf8');
  });
};
