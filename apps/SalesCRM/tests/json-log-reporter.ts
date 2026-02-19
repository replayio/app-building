import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

function ts(): string {
  return new Date().toISOString();
}

function log(obj: Record<string, unknown>) {
  console.log(JSON.stringify({ timestamp: ts(), ...obj }));
}

export default class JsonLogReporter implements Reporter {
  onBegin(_config: FullConfig, suite: Suite) {
    log({ event: 'run_start', totalTests: suite.allTests().length });
  }

  onTestBegin(test: TestCase, _result: TestResult) {
    log({
      event: 'test_start',
      title: test.title,
      file: test.location.file.replace(/.*tests\//, 'tests/'),
      line: test.location.line,
      project: test.parent.project()?.name,
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    log({
      event: 'test_end',
      title: test.title,
      file: test.location.file.replace(/.*tests\//, 'tests/'),
      line: test.location.line,
      status: result.status,
      duration: result.duration,
      ...(result.error ? { error: result.error.message?.split('\n')[0] } : {}),
    });
  }

  onEnd(result: FullResult) {
    log({ event: 'run_end', status: result.status });
  }
}
