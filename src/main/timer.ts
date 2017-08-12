export interface Timer {
  start(): void;
  tick(): void;
}

function createTimerInternal(cb: Function, nat = 1000, dt = 0) {

  function afterNoActivity() {
    setTimeout(() => cb(), dt);
  }

  let natId: NodeJS.Timer;

  const t = {
    start: () => {
      natId = setTimeout(() => {
        afterNoActivity();
      }, nat);
      return t;
    },
    tick: () => {
      if (natId) clearTimeout(natId);
      natId = setTimeout(afterNoActivity, nat);
      return t;
    },
  };
  return t;
}

const timers: {[id: number]: Timer} = {};

export function createTimer(win: Electron.BrowserWindow, opt: any) {
  timers[win.id] = createTimerInternal(() => win.close()).start();
}

export function tick(id: number) {
  const timer = timers[id];
  if (!timer) return;
  timer.tick();
}

