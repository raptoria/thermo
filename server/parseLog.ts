import fs from 'fs';
import readline from 'readline';
import { config } from './config';


export const emptyDirError = 'log directory is empty';
const currentDir = './server/logs';

export enum Instrument {
    thermometer = 'thermometer',
    humidity = 'humidity'
}

export interface InstrumentTrial {
    tempRef: number;
    humidityRef: number;
    type: Instrument;
    name: string;
    measurements: Array<number>;
}

interface LogOutput {
    [name:string]: string;
}

export const parseLogFiles = () => {
    const promises: Array<Promise<InstrumentTrial>> = [];
    return new Promise<Array<InstrumentTrial>>((resolve, reject) => {
        fs.readdir(currentDir, (err, files) => {
            if (err){
                reject(emptyDirError);
                return;
            }

            files.forEach((fileName: string) => {
                promises.push(parseFile(fileName));
            });

            Promise.all(promises)
            .then(values => resolve(values))
            .catch(error => reject(error));
        });
    });
};

export const parseFile = (fileName: string): Promise<InstrumentTrial> => {
    let instrumentTrial: Partial<InstrumentTrial> = {};
    instrumentTrial.measurements = [];

    const rd = readline.createInterface({
        input: fs.createReadStream(currentDir + '/'+ fileName),
    });

    rd.on('line', function(line:string) {
        if (line.indexOf('reference') > -1){
            const referenceLine = line.split(' ');
            instrumentTrial.tempRef = Number(referenceLine[1]);
            instrumentTrial.humidityRef = Number(referenceLine[2]);
        }
        else if (line.startsWith(Instrument.thermometer) || line.startsWith(Instrument.humidity)){
            const instrumentArr: Array<string> = line.split(' ');
            const type = instrumentArr[0] as keyof typeof Instrument;
            instrumentTrial.type = Instrument[type];
            instrumentTrial.name = instrumentArr[1];
            //console.log(instrumentTrial);
        }
        else {
            const measurementLine: Array<string> = line.split(' ');
            const value = Number(measurementLine[1]);
            if (!isNaN(value)){
                instrumentTrial.measurements!.push(value);
            }
        }
    });

    return new Promise<InstrumentTrial>((resolve) => {
        rd.on('close', () => {
            resolve(instrumentTrial as InstrumentTrial);
        });
    });
};

export const evaluateLogFile = (fileContents: Array<InstrumentTrial>) => {
    if (fileContents === undefined){
        console.log('no file contents');
        return;
    }
    const output = fileContents.map((trial:InstrumentTrial) => {
        if (trial.type === Instrument.thermometer){
            return evaluateThermometer(trial);
        }
        if (trial.type === Instrument.humidity){
            return evaluateHumidity(trial);
        }
    }).reduce((acc: LogOutput, currentValue: string[]| undefined) => { 
        if (currentValue !== undefined && currentValue.length === 2){
            acc[currentValue[0]] = currentValue[1];
        }
        return acc;
    }, {})

    //console.log(output);
    return output;
}; 

export const evaluateThermometer = (trial: InstrumentTrial) => {
    const mean = calculateMean(trial.measurements);
    const variance = calculateVariance(trial.measurements, mean);
    const stdev = Math.sqrt(variance);
    let defaultPrecision = '';
    //console.log('the std is ' + stdev);
    //console.log('the mean is ' + mean);

    for (let key in config.thermometer) {
        const meanRange: number = config.thermometer[key][0];
        const stDevThreshold: number = config.thermometer[key][1];
        
        if (meanRange == undefined || stDevThreshold === undefined){
            defaultPrecision = key;
        }
        if (Math.abs(mean - trial.tempRef) <= meanRange && stdev < stDevThreshold){
            return [trial.name, key];
        }
    }
    return [trial.name, defaultPrecision];
}

export const evaluateHumidity = (trial: InstrumentTrial) => {
    const percentPrecision = config.humidity['percent precision'];
    const acceptableRange = percentPrecision * trial.humidityRef;
    const keep = trial.measurements.every((value: number) => Math.abs(value - trial.humidityRef) <= acceptableRange);
    return [trial.name, keep ? 'keep' : 'discard'];
}

export const calculateMean = (list: Array<number>) => {
    const sum = list.reduce((acc, currentValue) => acc + currentValue, 0);
    return (sum/list.length);
}

export const calculateVariance = (list: Array<number>, mean: number) => {
    const sum = list.reduce((acc, currentValue) => acc + Math.pow(currentValue - mean, 2), 0);
    return (sum/list.length);
}
