const init = (x: number, y: number) => {
  const regex = new RegExp(`\\x1b\\[${y}m`, 'g');
  const open = `\x1b[${x}m`; const close = `\x1b[${y}m`;

  return function (text: string) {
    return open + (~('' + text).indexOf(close) ? text.replace(regex, close + open) : text) + close;
  };
};

// modifiers
export const bold = init(1, 22);
export const dim = init(2, 22);
export const hidden = init(8, 28);
export const inverse = init(7, 27);
export const italic = init(3, 23);
export const reset = init(0, 0);
export const strikeThrough = init(9, 29);
export const underline = init(4, 24);
export const black = init(30, 39);
export const blue = init(34, 39);
export const cyan = init(36, 39);
export const gray = init(90, 39);
export const green = init(32, 39);
export const grey = init(90, 39);
export const magenta = init(35, 39);
export const red = init(31, 39);
export const white = init(37, 39);
export const yellow = init(33, 39);
