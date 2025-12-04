const init = (openCode: number, closeCode: number) => {
  const regex = new RegExp(`\\x1b\\[${closeCode}m`, "g");
  const open = `\x1b[${openCode}m`;
  const close = `\x1b[${closeCode}m`;

  return function (txt: string) {
    const s = String(txt);
    return open + (regex.test(s) ? s.replace(regex, close + open) : s) + close;
  };
};

/* =======================
   MODIFIERS
======================= */

export const reset = init(0, 0);
export const bold = init(1, 22);
export const dim = init(2, 22);
export const italic = init(3, 23);
export const underline = init(4, 24);
export const inverse = init(7, 27);
export const hidden = init(8, 28);
export const strikeThrough = init(9, 29);

/* =======================
   FOREGROUND COLORS
======================= */

export const black = init(30, 39);
export const red = init(31, 39);
export const green = init(32, 39);
export const yellow = init(33, 39);
export const blue = init(34, 39);
export const magenta = init(35, 39);
export const cyan = init(36, 39);
export const white = init(37, 39);

/* Bright variants */
export const brightBlack = init(90, 39);
export const brightRed = init(91, 39);
export const brightGreen = init(92, 39);
export const brightYellow = init(93, 39);
export const brightBlue = init(94, 39);
export const brightMagenta = init(95, 39);
export const brightCyan = init(96, 39);
export const brightWhite = init(97, 39);

/* Legacy aliases */
export const grey = brightBlack;
export const gray = brightBlack;
export const lightGray = init(90, 39);
/* =======================
   BACKGROUND COLORS
======================= */

export const bgBlack = init(40, 49);
export const bgRed = init(41, 49);
export const bgGreen = init(42, 49);
export const bgYellow = init(43, 49);
export const bgBlue = init(44, 49);
export const bgMagenta = init(45, 49);
export const bgCyan = init(46, 49);
export const bgWhite = init(47, 49);

/* Bright background variants */
export const bgBrightBlack = init(100, 49);
export const bgBrightRed = init(101, 49);
export const bgBrightGreen = init(102, 49);
export const bgBrightYellow = init(103, 49);
export const bgBrightBlue = init(104, 49);
export const bgBrightMagenta = init(105, 49);
export const bgBrightCyan = init(106, 49);
export const bgBrightWhite = init(107, 49);

export function colorizeJson(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);

  return json.replace(
    /"(.*?)"(?=\s*:)|"([^"]*)"|(\b\d+(\.\d+)?\b)|\b(true|false|null)\b/g,
    (match, key, str, num, _, bool) => {
      if (key) return cyan(`"${key}"`); 
      if (str) return green(`"${str}"`);
      if (num) return yellow(num);
      if (bool === "true" || bool === "false") return magenta(bool); 
      if (bool === "null") return gray("null");
      return match;
    }
  );
}