exports.handler = async (type, name, options) => {
  try {
    switch (type) {
    case 'middleware':
      require('./middleware')(name, options);
      break;
    case 'service':
      require('./service')(name, options);
      break;
    case 'project':
      break;
    default:
      console.error('Unknown template type.');
    }
  } catch (error) {
    console.error(error);
  }
};
