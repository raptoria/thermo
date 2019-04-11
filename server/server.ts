import express from 'express';
import cors = require('cors');
import { evaluateLogFile } from './parseLog';

const app = express();

app.use(cors());

app.get('/getSensorResults', async (req: any, res: any) => {
  try {
    const result = await evaluateLogFile('');
    res.send(result);
  } catch (err){
    console.error(err);
  }
});

app.listen(3001, () =>
  console.log(`Example app listening on port 3001!`),
);