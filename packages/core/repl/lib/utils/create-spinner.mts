import ora from 'ora';

export default function createSpinner (text: string, type: string = 'dots4') {
  return ora({
    text,
    spinner: type
  });
}
