const axios = require('axios');

const https = require('https');

const chalk = require('chalk');

const fs = require('fs');



// Get wallet address from command line argument

const wallet = process.argv[2];



if (!wallet) {

  console.log(chalk.red('❌ Please provide a wallet address:'));

  console.log(chalk.yellow('Usage: node bot.js <wallet-address>'));

  process.exit(1);

}



// ✅ Fix: Bypass SSL verification (temporary workaround)

const agent = new https.Agent({ rejectUnauthorized: false });



const config = {

  method: 'GET',

  url: `https://beta.orchestrator.nexus.xyz/users/${wallet}`,

  headers: {

    'User-Agent': 'Mozilla/5.0',

    'Accept': 'application/json',

  },

  timeout: 60000, // ✅ Increased timeout to 60 seconds to prevent failures

  httpsAgent: agent

};



// ✅ Improved display function

function displayNodeInfo(data) {

  console.clear();

  const now = new Date().toLocaleString();

  console.log(chalk.yellowBright(`\n🕒 Last Updated: ${now}`));

  console.log(chalk.magentaBright('═'.repeat(50)));

  console.log(chalk.cyanBright('           NEXUS NODE INFORMATION BY ASHU☠️ '));

  console.log(chalk.magentaBright('═'.repeat(50)));

  console.log(chalk.blueBright(`🔗 Wallet: ${data.walletAddress}`));



  let totalPoints = 0;

  let webNodes = 0;

  let cliNodes = 0;



  data.nodes.forEach(node => {

    totalPoints += node.testnet_two_points;

    if (node.nodeType === 1) webNodes++;

    if (node.nodeType === 2) cliNodes++;

  });



  console.log(chalk.green('\n📊 Summary:'));

  console.log('─'.repeat(50));

  console.log(chalk.whiteBright(`Total Nodes: ${data.nodes.length}`));

  console.log(chalk.blueBright(`WEB Nodes: ${webNodes}`));

  console.log(chalk.magentaBright(`CLI Nodes: ${cliNodes}`));

  console.log(chalk.greenBright(`💰 Total Active Points: ${totalPoints.toLocaleString()}`));



  console.log(chalk.blue('\n🔵 Active Nodes (with points):'));

  console.log('─'.repeat(50));

  console.log(chalk.white('NodeID'.padEnd(10) + 'Type'.padEnd(10) + 'Points'.padEnd(10) + 'Last Updated'));

  console.log('─'.repeat(50));



  const activeNodes = data.nodes.filter(node => node.testnet_two_points > 0);

  if (activeNodes.length === 0) {

    console.log(chalk.red("No active nodes with points."));

  } else {

    activeNodes.sort((a, b) => b.testnet_two_points - a.testnet_two_points)

      .forEach(node => {

        const nodeType = node.nodeType === 1 ? 'WEB' : 'CLI';

        console.log(

          chalk.yellow(`${node.id}`.padEnd(10)) +

          chalk.cyan(`${nodeType}`.padEnd(10)) +

          chalk.green(`${node.testnet_two_points.toLocaleString()}`.padEnd(10)) +

          chalk.white(new Date(node.lastUpdated).toLocaleString())

        );

      });

  }

  console.log(chalk.magentaBright('═'.repeat(50)));



  // ✅ Save data to file

  fs.writeFileSync('nexus_data.json', JSON.stringify(data, null, 2));

  console.log(chalk.green('📁 Data saved to nexus_data.json'));

}



// ✅ Auto-refresh countdown (Every 20 seconds)

let countdown = 20;

function showCountdown() {

  process.stdout.write(`⏳ Refreshing in ${countdown}s...\r`);

  countdown--;



  if (countdown < 0) {

    countdown = 20; // Reset countdown

    checkNodes();   // Fetch new data

  }

}



// ✅ Fix: Ensure API data is properly retrieved and bot doesn't stop

async function checkNodes() {

  try {

    console.log(chalk.cyan("\n🔄 Fetching latest Nexus node data..."));

    const response = await axios.request(config);



    if (response.data && response.data.data) {

      displayNodeInfo(response.data.data);

    } else {

      console.error(chalk.red("❌ Invalid response structure:"), response.data);

    }

  } catch (error) {

    console.error(chalk.red('❌ Error fetching node data:'), error.message);

    console.log(chalk.yellow('🔁 Retrying in 20 seconds...'));

  }

}



// ✅ Startup message

console.log(chalk.green('\n🚀 Starting Nexus Node Monitor...'));

console.log(chalk.yellow('Press Ctrl+C to exit\n'));



// ✅ Run the first update immediately

checkNodes();



// ✅ Show countdown timer

setInterval(showCountdown, 1000); // Updates countdown every second

