import { NS_PER_SEC } from '../../constants';
import { floor } from 'lodash';

export function logTime(message = 'Database synced', time) {
  if (!time) {
    console.log(`${message}. (time unavailable)`);
  } else {
    let [execS, execNs] = process.hrtime(time);
    let ms = (execS * NS_PER_SEC + execNs) / 1000000;
    let seconds = floor(ms / 1000, 3);

    console.log(`${message} in ${seconds} s`);

    return seconds;
  }
}
