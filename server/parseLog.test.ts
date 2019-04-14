import { parseFile, parseLogFiles, emptyDirError, Instrument } from "./parseLog";
import mock from 'mock-fs';

it('throws an error if there are no log files', async () => {
  mock({
  });
  await expect(parseLogFiles()).rejects.toEqual(emptyDirError);
})

it('correctly parses log files', async () => {
  mock({
    './server/logs/temp-3.txt': 
    'reference 70.0 45.0 \n' +
    'thermometer temp-3 \n' +
    '2007-04-05T22:00 72.4 \n' +
    '2007-04-05T22:01 76.0 \n' +
    '2007-04-05T22:02 79.1 \n' +
    '2007-04-05T22:03 75.6 \n' +
    '2007-04-05T22:04 71.2 \n' +
    '2007-04-05T22:05 71.4 \n' +
    '2007-04-05T22:06 69.2 \n' +
    '2007-04-05T22:07 65.2 \n' +
    '2007-04-05T22:08 62.8 \n' +
    '2007-04-05T22:09 61.4 \n' +
    '2007-04-05T22:10 64.0 \n' +
    '2007-04-05T22:11 67.5 \n' +
    '2007-04-05T22:12 69.4'
  });
  const trialObject = {
    name: 'temp-3',
    tempRef: 70.0,
    humidityRef: 45,
    type: Instrument.thermometer,
    measurements: [72.4, 76.0, 79.1, 75.6, 71.2, 71.4, 69.2, 65.2, 62.8, 61.4, 64.0, 67.5, 69.4]
  }
  await expect(parseFile('temp-3.txt')).resolves.toEqual(trialObject);
});
