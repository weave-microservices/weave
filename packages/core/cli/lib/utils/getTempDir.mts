import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import home from 'user-home';
import { deleteFolderRecursive } from './deleteFolderRecursive.mts';

export const getTempDir = (dir: string, clear: boolean = false): string => {
  const tmp = path.join(home, '.weave-cli-templates', dir.replace(/[^a-zA-Z0-9]/g, '-'));
  if (fs.existsSync(tmp) && clear) {
    deleteFolderRecursive(tmp);
  }
  mkdirp.sync(tmp);
  return tmp;
};
