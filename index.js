const toArray	= require('lodash.toarray')
const util		= require('util')

const interceptor = (string, callback) => {
  // only intercept the string
  const result = callback(string);
  if (typeof result == 'string') {
    string = result.replace( /\n$/ , '' ) + (result && (/\n$/).test( string ) ? '\n' : '');
  }
  return string;
}

module.exports = (stdoutIntercept, stderrIntercept) => {
	stderrIntercept = stderrIntercept || stdoutIntercept;

	const old_stdout_write = process.stdout.write;
	const old_stderr_write = process.stderr.write;

  return {
    start: () => {
      process.stdout.write = ((write => function(string, encoding, fd) {
        const args = toArray(arguments);
        args[0] = interceptor( string, stdoutIntercept );
        write.apply(process.stdout, args);
      })(process.stdout.write));

      process.stderr.write = ((write => function(string, encoding, fd) {
        const args = toArray(arguments);
        args[0] = interceptor( string, stderrIntercept );
        write.apply(process.stderr, args);
      })(process.stderr.write));
    },
    // puts back to original
    unhook: () => {
      process.stdout.write = old_stdout_write;
		  process.stderr.write = old_stderr_write;
    }
  }
}
