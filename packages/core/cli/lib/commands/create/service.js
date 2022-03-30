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

  // Handle file suffix option (.service.js)
  const suffix = options.suffix ? options.suffix : 'service';

  // Build service file path
  const newServicePath = path.join(serviceFolder, `${serviceName}.${suffix}.js`);

  // Render service file from template
  ejs.renderFile(path.join(__dirname, 'templates', 'service.ejs'), { serviceName }, null, function (error, result) {
    if (error) {
      throw error;
    }

    console.log(`✨ Writing file in ${kleur.yellow(newServicePath)}`);
    // Write file
    fs.writeFileSync(path.resolve(newServicePath), result, 'utf8');
  });
};
