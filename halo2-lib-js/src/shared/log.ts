export function captureConsoleOutput(cb: any, log: any, time: any, timeEnd: any): () => number[] {
  const originalLog = log;
  const originalTime = time;
  const originalTimeEnd = timeEnd;
  let timeArray = [] as number[];

  const timeLogs = {} as any;

  //@ts-ignore
  console.log = function (...args) {
    cb(args[0]);
    // originalLog.apply(console, args);
  };

  console.time = function (label: string) {
    timeLogs[label] = performance.now();
  };

  console.timeEnd = function (label: string) {
    const startTime = timeLogs[label];
    if (startTime !== undefined) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      // originalLog.apply(console, [`%c${label}:`, 'color: #0074D9; font-weight: bold', `${duration.toFixed(2)}ms`])
      cb(`${label}: ${duration.toFixed(2)}ms`);
      timeArray.push(duration);
      delete timeLogs[label];
    }
  };

  return () => {
    console.log = originalLog;
    console.time = originalTime;
    console.timeEnd = originalTimeEnd;
    return timeArray;
  };
}