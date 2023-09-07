import { dotGet } from './dot-get';
import { dotSet } from './dot-set';
import { Path, PathValue } from './helper/dot-notation-path';

export function pick<T extends Object, P extends Path<T>>(object: T, props: P[]): PathValue<T, P> {
  const picked = {};

  for (const prop of props) {
    dotSet(picked, prop, dotGet(object, prop));
  }

  return picked as PathValue<T, P>[];
};
