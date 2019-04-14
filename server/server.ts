import express from 'express';
import cors = require('cors');
import { parseLogFiles, evaluateLogFile, InstrumentTrial } from './parseLog';

const app = express();

app.use(cors());

app.get('/getTestResults', async (req: any, res: any) => {
  try {
    const fileContents: Array<InstrumentTrial> = await parseLogFiles();
    const output = evaluateLogFile(fileContents);
    res.send(output);
  } catch (err){
    console.error(err);
  }
});

app.listen(3001, () =>
  console.log(`Example app listening on port 3001!`),
);