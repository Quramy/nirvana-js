import { NirvanaConfig } from "../types/config";

export interface Timer {
  start(): void;
  tick(): void;
}

function createTimerInternal(cb: Function, conf: NirvanaConfig) {

  function afterNoActivity() {
    setTimeout(() =>cb(), conf.browserNoActivityTimeout);
  }

  let natId: NodeJS.Timer;

  const t = {
    start: () => {
      natId = setTimeout(() => afterNoActivity(), conf.browserNoActivityTimeout);
      return t;
    },
    tick: () => {
      if (natId) clearTimeout(natId);
      natId = setTimeout(afterNoActivity, conf.browserNoActivityTimeout);
      return t;
    },
  };
  return t;
}

const timers: {[id: number]: Timer} = { };

export function createTimer(id: number, cb: Function, conf: NirvanaConfig) {
  timers[id] = createTimerInternal(cb, conf).start();
}

export function getTimer(id: number) {
  return timers[id];
}

export function tick(id: number) {
  const timer = timers[id];
  if (!timer) return;
  timer.tick();
}

