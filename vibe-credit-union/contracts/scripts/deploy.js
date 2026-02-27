const hre = require("hardhat");

// USDC addresses per network
const USDC_ADDRESSES = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

async function main() {
  const network = hre.network.name;
  const usdcAddress = USDC_ADDRESSES[network];

  if (!usdcAddress) {
    throw new Error(
      `No USDC address configured for network: ${network}. Use --network base or --network baseSepolia`
    );
  }

  console.log(`Deploying VIBEPool on ${network}...`);
  console.log(`USDC address: ${usdcAddress}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const VIBEPool = await hre.ethers.getContractFactory("VIBEPool");
  const pool = await VIBEPool.deploy(usdcAddress);
  await pool.waitForDeployment();

  const address = await pool.getAddress();
  console.log(`VIBEPool deployed to: ${address}`);

  // Verify ADMIN_ROLE was granted to deployer
  const ADMIN_ROLE = await pool.ADMIN_ROLE();
  const hasRole = await pool.hasRole(ADMIN_ROLE, deployer.address);
  console.log(`Deployer has ADMIN_ROLE: ${hasRole}`);

  // Log verification command
  console.log("\nTo verify on Basescan:");
  console.log(
    `npx hardhat verify --network ${network} ${address} ${usdcAddress}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
