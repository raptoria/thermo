import fs from 'fs';
import readline from 'readline';
import { config } from './config';
const currentDir = './server/logs';

enum Instrument {
    thermometer = 'thermometer',
    humidity = 'humidity'
}

interface InstrumentTrial {
    tempRef: number;
    humidityRef: number;
    type: Instrument;
    name: string;
    measurements: Array<number>;
}

interface LogOutput {
    [name:string]: string;
}

(function parseLogFile(){
    const promises: Promise<InstrumentTrial>[] = [];

    fs.readdir(currentDir, (err, files) => {
        if (err){
            throw Error('could not read dir');
        }
        //console.log(files);
        files.forEach(file => {
           
            let instrumentTrial: Partial<InstrumentTrial> = {};
            instrumentTrial.measurements = [];

            const rd = readline.createInterface({
                input: fs.createReadStream(currentDir + '/'+ file),
            });

            rd.on('line', function(line:string) {
                if (line.indexOf('reference') > -1){
                    const referenceLine = line.split(' ');
                    instrumentTrial.tempRef = Number(referenceLine[1]);
                    instrumentTrial.humidityRef = Number(referenceLine[2]);
                }
                else if (line.startsWith(Instrument.thermometer) || line.startsWith(Instrument.humidity)){
                    const thermoArr: Array<string> = line.split(' ');
                    // @ts-ignore
                    instrumentTrial.type = Instrument[thermoArr[0]];
                    instrumentTrial.name = thermoArr[1];
                    //console.log(instrumentTrial);
                }
                else {
                    const measurementLine:Array<string> = line.split(' ');
                    const value = Number(measurementLine[1]);
                    if (!isNaN(value)){
                        instrumentTrial.measurements!.push(value);
                    }
                }
            });

            const promise = new Promise<InstrumentTrial>((resolve) => {
                rd.on('close', () => {
                    resolve(instrumentTrial as InstrumentTrial);
                });
            });

            promises.push(promise);
        });

        Promise.all(promises)
        .then(values => { 
            evaluateLogFile(values);
        })
        .catch(error => { 
            console.log(error.message)
        });
    });
})();

export const evaluateLogFile = (fileContents: Array<InstrumentTrial>) => {
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
    
    console.log(output);
}; 

const evaluateThermometer = (trial: InstrumentTrial) => {
    const mean = calculateMean(trial.measurements);
    const variance = calculateVariance(trial.measurements, mean);
    const stdev = Math.sqrt(variance);
    //console.log('the std is ' + stdev);
    //console.log('the mean is ' + mean);

    for (let key in config.thermometer) {
        const meanRange: number = config.thermometer[key][0];
        const stDevThreshold: number = config.thermometer[key][1];
        
        if (meanRange === undefined || stDevThreshold === undefined){
            return [trial.name, key];
        }
        if (Math.abs(mean - trial.tempRef) <= meanRange && stdev < stDevThreshold){
            return [trial.name, key];
        }
    }
}

const evaluateHumidity = (trial: InstrumentTrial) => {
    const percentPrecision = config.humidity['percent precision'];
    const acceptableRange = percentPrecision * trial.humidityRef;
    const keep = trial.measurements.every((value: number) => Math.abs(value - trial.humidityRef) <= acceptableRange);
    return [trial.name, keep ? 'keep' : 'discard'];
}

const calculateMean = (list: Array<number>) => {
    const sum = list.reduce((acc, currentValue) => acc + currentValue, 0);
    return (sum/list.length);
}

const calculateVariance = (list: Array<number>, mean: number) => {
    const sum = list.reduce((acc, currentValue) => acc + Math.pow(currentValue - mean, 2), 0);
    return (sum/list.length);
}
