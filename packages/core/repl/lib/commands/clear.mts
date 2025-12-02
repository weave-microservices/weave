export default ({ vorpal }: any) => {
  vorpal
    .command('clear', 'Clear console.')
    .alias('cc')
    .action((_: any, done: any) => {
      process.stdout.write('\x1Bc');
      done();
    });
};
