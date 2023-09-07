const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ejs = require('ejs');
const kleur = require('kleur');

module.exports = async (serviceName, options) => {
  const { serviceFolder } = await inquirer.prompt([
    {
      type: 'input',
      name: 'serviceFolder',
      message: 'Service directory',
      default: './services',
      validate (input) {
        if (!fs.existsSync(path.resolve(input))) {
          return `The '${input}' directory is not exists! Full path: ${path.resolve(input)}`;
        }

        return true;
      }
    }
  ]);

  const suffix = options.suffix ? options.suffix : 'service';

  const newServicePath = path.join(serviceFolder, `${serviceName}.${suffix}.js`);

  ejs.renderFile(path.join(__dirname, 'templates', 'service.ejs'), { serviceName }, null, function (error, result) {
    if (error) {
      throw error;
    }

    console.log(`✨ Writing file in ${kleur.yellow(newServicePath)}`);
    fs.writeFileSync(path.resolve(newServicePath), result, 'utf8');
  });
};
