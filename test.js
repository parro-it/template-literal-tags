import test from "ava";
import { report, upper, justify } from ".";

test("simple", t => {
  t.is(report`a${42}c`, "a42c\n");
});

test("upper", t => {
  const res = report`
    abcd
    ${upper.start}
      abcd
    ${upper.end}
  `;
  t.is(res, `abcd\nABCD\n`);
});

test("justify", t => {
  const res = report`
    This option shall be supported if the implementation
    supports the User Portability Utilities option. It
    shall cause the shell to notify the user asynchronously

    ${justify.start}
       of background job completions. The following
       message is written to standard error: "[%d]%c %s%s\n"
       , <job-number>, <current>, <status>, <job-name> where
       the fields shall be as follows: <current> The character
        '+' identifies the job that would be used as a default
         for the fg or bg utilities; this job can also be
          specified using the job_id "%+" or "%%". The character
           '-' identifies the job that would become the default
    ${justify.end}
  `;

  t.is(
    res,
    `This option shall be supported if the implementation
supports the User Portability Utilities option. It
shall cause the shell to notify the user asynchronously

of background job completions. The following
message  is written    to  standard  error:
"[%d]%c  %s%s " ,  <job-number>, <current>,
<status>, <job-name> where the fields shall
be as follows:  <current> The character '+'
identifies the job that would be used  as a
default for the fg or bg utilities; this job
can also be specified using the job_id "%+"
or "%%".  The  character '-' identifies the
job that would become the default
`
  );
});

test("auto unindent", t => {
  const res = report`
       a
        b
         c
       `;
  t.is(res, "a\n b\n  c\n");
});
