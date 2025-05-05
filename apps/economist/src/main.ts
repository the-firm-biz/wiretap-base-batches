import { CronJob } from 'cron';
import { processTokenPrices } from './processTokenPrices.js';
// import type { Token } from '@wiretap/db';

// const MOCK_DB_STUFF = {
//   deploymentTransactionHash: '0x000',
//   block: 1,
//   deploymentContractId: 1,
//   accountEntityId: 1,
//   athPriceUsd: '0',
//   createdAt: new Date()
// };

// const MOCK_TOKENS: Token[] = [
//   {
//     id: 1,
//     name: 'luminous',
//     symbol: 'LUM',
//     address: '0x0fD7a301B51d0A83FCAf6718628174D527B373b6',
//     ...MOCK_DB_STUFF
//   },
//   {
//     id: 2,
//     name: 'Dwight K. Schrute',
//     symbol: 'BEETS',
//     address: '0x114800110DB007c8E611d32F76E7B63023957E33',
//     ...MOCK_DB_STUFF
//   },
//   {
//     id: 3,
//     name: 'DebtReliefBot',
//     symbol: 'DRB',
//     address: '0x3ec2156D4c0A9CBdAB4a016633b7BcF6a8d68Ea2',
//     ...MOCK_DB_STUFF
//   }
// ];

const start = () => {
  const processTokenPricesJob = async () => {
    console.log('Cron job started');
    await processTokenPrices();
    // getTokenPrices(MOCK_TOKENS);
  };
  const job = new CronJob('* * * * *', processTokenPricesJob);
  processTokenPricesJob(); // Run first time immediately
  job.start(); // Schedules subsequent runs
};

start();
