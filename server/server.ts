import express from 'express';
import cors = require('cors');
import { parseLogFile, evaluateLogFile } from './parseLog';

const app = express();

app.use(cors());

app.get('/getSensorResults', async (req: any, res: any) => {
  try {
    const fileContents: any = await parseLogFile();
    console.log(fileContents);
    const output = evaluateLogFile(fileContents);
    res.send(output);
  } catch (err){
    console.error(err);
  }
});

app.listen(3001, () =>
  console.log(`Example app listening on port 3001!`),
);