import fs from 'fs';
import readline from 'readline';
const currentDir = './server/logs';

enum Instrument {
    thermometer = 'thermometer',
    humidity = 'humidity'
}

interface InstrumentTrial {
    reference: Array<number>;
    type: Instrument;
    name: string;
    measurements: Array<number>;
}

(function parseLogFile(){
    const promises: Promise<InstrumentTrial>[] = [];
    fs.readdir(currentDir, (err, files) => {
        if (err){
            throw Error('could not read dir');
        }
        console.log(files);
        files.forEach(file => {
           
            let instrumentTrial: Partial<InstrumentTrial> = {};
            instrumentTrial.measurements = [];

            const rd = readline.createInterface({
                input: fs.createReadStream(currentDir + '/'+ file),
            });

            const promise = new Promise<InstrumentTrial>((resolve) => {
                rd.on('close', () => {
                    resolve(instrumentTrial as InstrumentTrial);
                });
            });

            promises.push(promise);
            Promise.all(promises).then((values) => console.log(values)); 

            rd.on('line', function(line:string) {
                if (line.indexOf('reference') > -1){
                    instrumentTrial.reference = line.split(' ').slice(1,3).map(Number);
                }
                else if (line.startsWith(Instrument.thermometer) || line.startsWith(Instrument.humidity)){
                    const thermoArr = line.split(' ');
                    instrumentTrial.type = Instrument[thermoArr[0]];
                    instrumentTrial.name = thermoArr[1];
                    //console.log(instrumentTrial);
                }
                else {
                    const measurementLine:Array<string> = line.split(' ');
                    let measurements = instrumentTrial.measurements;
                    const value = Number(measurementLine[1]);
                    if (!isNaN(value)){
                        measurements!.push(value);
                    }
                }
            });
        });
    });

    //return evaluateLogFile({});
})();

export function evaluateLogFile (fileContents) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = {
                'temp-1': 'precise',
                'temp-2': 'ultra precise',
                'hum-1': 'keep',
                'hum-2': 'discard'
              }
            resolve(result);
        }, 200);
    });
}
