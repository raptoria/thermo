import { parseFile, parseLogFiles, emptyDirError, Instrument, InstrumentTrial } from './parseLog';
import mock from 'mock-fs';
import * as parseLog from './parselog';

let logsArr: Array<any> = [];
let logMock: any = null;

beforeAll(() => {
  logMock = jest.spyOn(console, 'log').mockImplementation((...args) => {
    logsArr.push(args) //lstat fix for Jest because mock-fs commandeers console.log
  })
})

afterAll(() => {
  logMock.mockRestore();
  mock.restore();
  logsArr.map(log => console.log(...log));
  logsArr = [];
})

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

describe('inspecting methods', () => {
  let meanMock:any, varianceMock:any, humidityMock:any, thermoMock:any = null;

  beforeEach(() => {
    meanMock = jest.spyOn(parseLog, 'calculateMean');
    varianceMock = jest.spyOn(parseLog, 'calculateVariance');
    humidityMock = jest.spyOn(parseLog, 'evaluateHumidity');
    thermoMock = jest.spyOn(parseLog, 'evaluateThermometer');
  })

  afterEach(() => {
    meanMock.mockRestore();
    varianceMock.mockRestore();
    thermoMock.mockRestore();
    humidityMock.mockRestore();
  })

  it('returns the correct test results', async () => {
    mock({
      './server/logs/temp-3.txt': 
          'reference 70.0 45.0 \n' +
          'thermometer temp-3 \n' +
          '2007-04-05T22:00 70.4 \n' +
          '2007-04-05T22:01 71.0 \n' +
          '2007-04-05T22:02 69.9 \n' +
          '2007-04-05T22:03 68.6 \n' +
          '2007-04-05T22:04 70.3',
      './server/logs/temp-4.txt': 
          'reference 70.0 45.0 \n' +
          'thermometer temp-4 \n' +
          '2007-04-05T22:00 72.4 \n' +
          '2007-04-05T22:01 76.0 \n' +
          '2007-04-05T22:02 79.1 \n' +
          '2007-04-05T22:03 75.6 \n' +
          '2007-04-05T22:04 71.2',
      './server/logs/temp-5.txt': 
          'reference 70.0 45.0 \n' +
          'thermometer temp-5 \n' +
          '2007-04-05T22:00 70.4 \n' +
          '2007-04-05T22:01 77.0 \n' +
          '2007-04-05T22:02 62.9 \n' +
          '2007-04-05T22:03 65.6 \n' +
          '2007-04-05T22:04 72.3', 
      './server/logs/hum-3.txt':
          'reference 70.0 45.0 \n' +
          'humidity hum-3 \n' +
          '2007-04-05T22:04 45.2 \n' +
          '2007-04-05T22:05 45.3 \n' +
          '2007-04-05T22:06 45.46'
    });

    const mockResult = { 'hum-3': 'discard', 
                        'temp-3': 'ultra precise', 
                        'temp-4': 'precise',
                        'temp-5': 'very precise' };
    
    const fileContents: Array<InstrumentTrial> = await parseLogFiles();

    expect(parseLog.evaluateLogFile(fileContents)).toEqual(mockResult);
    expect(meanMock).toHaveBeenCalledTimes(3);
    expect(varianceMock).toHaveBeenCalledTimes(3);
    expect(thermoMock).toHaveBeenCalledTimes(3);
    expect(humidityMock).toHaveBeenCalledTimes(1);
  })

  it('calculates the mean and variance correctly', () => {
    const list = [1,2];
    const mean = parseLog.calculateMean(list);
    const variance = parseLog.calculateVariance(list, mean);

    expect(mean).toEqual(1.5);
    expect(variance).toEqual(0.25);
    expect(meanMock).toHaveBeenCalledTimes(1);
    expect(varianceMock).toHaveBeenCalledTimes(1);
  })

   it('evaluates humidity correctly', () => {
    const trial1 = {
      name: 'hum-3',
      tempRef: 70.0,
      humidityRef: 45,
      type: Instrument.humidity,
      measurements: [45.2, 45.3, 45.46]
    }
    const trial2 = {
      name: 'hum-4',
      tempRef: 70.0,
      humidityRef: 65,
      type: Instrument.humidity,
      measurements: [65.2, 65.3, 65.44]
    }
    const result1 = parseLog.evaluateHumidity(trial1);
    expect(result1).toEqual(['hum-3', 'discard']);

    const result2 = parseLog.evaluateHumidity(trial2);
    expect(result2).toEqual(['hum-4', 'keep']);
  })


  it('evaluates thermometers correctly', () => {
    const trial1 = {
      name: 'temp-1',
      tempRef: 60.0,
      humidityRef: 45,
      type: Instrument.thermometer,
      measurements: [60.4, 61.0, 59.9, 58.6, 60.3]
    }
    const trial2 = {
      name: 'temp-2',
      tempRef: 60.0,
      humidityRef: 45,
      type: Instrument.thermometer,
      measurements: [60.4, 67.0, 52.9, 55.6, 62.3]
    }
    const trial3 = {
      name: 'temp-3',
      tempRef: 70.0,
      humidityRef: 45,
      type: Instrument.thermometer,
      measurements: [50.5, 65.3, 90.5, 80.0]
    }
    
    const result1 = parseLog.evaluateThermometer(trial1);
    expect(result1).toEqual(['temp-1', 'ultra precise']);

    const result2 = parseLog.evaluateThermometer(trial2);
    expect(result2).toEqual(['temp-2', 'very precise']);

    const result3 = parseLog.evaluateThermometer(trial3);
    expect(result3).toEqual(['temp-3', 'precise']);
  })

});