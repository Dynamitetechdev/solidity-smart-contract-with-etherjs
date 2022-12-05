const ethers = require("ethers");
const fs = require("fs-extra");
const colors = require("colors");
require("dotenv").config();

async function main() {
  // 1. create a provider that connects to ganache RPC Server
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  // 2. connect one of the ganache wallet privavte keys and note it is not secure to put a private key in to our codes like this.
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(process.env.PRIVATE_KEY);

  //reading our abi file using fs
  const abi = fs.readFileSync("./simpleStorage_sol_SimpleStorage.abi", "utf-8");

  //reading our abi file using fs
  const binary = fs.readFileSync(
    "./simpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );

  // contractFactory send a initCode transaction and which the initCode will be evaluated and the new code will result to a new contract, it carries 3 parameters the
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  // so once it result the new contract we want to wait for it to finish deploying and assign it to a contract variable.
  const contract = await contractFactory.deploy();

  // we want to create a transaction receipt for our contract and if it is done we can assign to our transaction receipt variable
  const deploymentReceipt = await contract.deployTransaction.wait(1);

  // console.log("THIS IS THE DEPLOYMENT TRANSACTION".cyan.underline);
  // console.log(contract.deployTransaction);

  // console.log("THIS IS THE DEPLOYMENT RECEIPT ".cyan.underline);
  // console.log(deploymentReceipt);

  const currentNumber = await contract.viewNumber();

  // normal the currentNumber will result to a big Number which javascript cannot understand, so will log as a string
  console.log(`Number: ${currentNumber.toString()}`.cyan);

  // we want to call our store function and pass in a newNumber
  const storeTxResponse = await contract.storeNumber("7");

  // the wait just simply means wait one block before you execute the rest of he code
  const storeTxReceipt = await storeTxResponse.wait(1);

  const newUpdateNumber = await contract.viewNumber();
  console.log(`our new stored number is: ${newUpdateNumber}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
