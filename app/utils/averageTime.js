import { round } from 'lodash';

export function averageTime(name = '') {
  let durations = []
  
  return (duration) => {
    durations.push(duration)
    
    if(durations.length >= 50) {
      let sum = durations.reduce((total, dur) => total + dur, 0)
      let length = Math.max(1, durations.length)
      let avg = round(sum / length, 4)
  
      console.log(`${name ? `${name}:` : ''} average duration: ${avg} s`);
      
      durations = []
    }
  }
}
