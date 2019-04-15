import { parseFile, parseLogFiles, emptyDirError, Instrument, evaluateLogFile, InstrumentTrial } from './parseLog';
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

it('returns the test results in the correct format', async () => {
  mock({
    './server/logs/temp-3.txt': 
        'reference 70.0 45.0 \n' +
        'thermometer temp-3 \n' +
        '2007-04-05T22:00 72.4 \n' +
        '2007-04-05T22:01 76.0 \n' +
        '2007-04-05T22:02 79.1 \n' +
        '2007-04-05T22:03 75.6 \n' +
        '2007-04-05T22:04 71.2',
    './server/logs/temp-4.txt': 
        'reference 70.0 45.0 \n' +
        'thermometer temp-4 \n' +
        '2007-04-05T22:00 72.4 \n' +
        '2007-04-05T22:01 76.0 \n' +
        '2007-04-05T22:02 79.1 \n' +
        '2007-04-05T22:03 75.6 \n' +
        '2007-04-05T22:04 71.2',
    './server/logs/hum-3.txt':
        'reference 70.0 45.0 \n' +
        'humidity hum-3 \n' +
        '2007-04-05T22:04 45.2 \n' +
        '2007-04-05T22:05 45.3 \n' +
        '2007-04-05T22:06 45.46'
  });
/*   const fileContents: Array<InstrumentTrial> = [
    { humidityRef: 45,
      measurements: [45.2, 45.3, 45.1], 
      name: 'hum-3', 
      tempRef: 70, 
      type: Instrument.humidity}, 
    { humidityRef: 45, 
      measurements: [72.4], 
      name: 'temp-3', 
      tempRef: 70, 
      type: Instrument.thermometer}, 
    { humidityRef: 45, 
      measurements: [73.1], 
      name: 'temp-4', 
      tempRef: 70, 
      type: Instrument.thermometer}] */

  const mockResult = { 'hum-3': 'discard', 'temp-3': 'precise', 'temp-4': 'precise' };
  const fileContents: Array<InstrumentTrial> = await parseLogFiles();
  mock.restore(); //restore fs function so Jest can work properly
  expect(evaluateLogFile(fileContents)).toEqual(mockResult);
})
