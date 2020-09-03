import { NS_PER_SEC } from '../../constants';
import { floor } from 'lodash';

export function currentSeconds(time) {
  let [execS, execNs] = process.hrtime(time);
  let ms = (execS * NS_PER_SEC + execNs) / 1000000;
  return floor(ms / 1000, 3);
}

export function logTime(message = 'Database synced', time) {
  let seconds = currentSeconds(time);
  console.log(`${message} in ${seconds} s`);
  return seconds;
}
