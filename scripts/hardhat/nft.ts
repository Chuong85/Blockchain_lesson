import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("🚀 ~ main ~ owner:", owner.address)

  const traningNFT = await ethers.getContractFactory("TrainingNFT");
  const traning = await traningNFT.deploy(owner.address);
  await traning.waitForDeployment();
  console.log("Token deployed to:", await traning.getAddress());

  const marketPlace = await ethers.getContractFactory("MarketPlace");
  const marketPlaceContract = await marketPlace.deploy();
  await marketPlaceContract.waitForDeployment();
  console.log("MarketPlace deployed to:", await marketPlaceContract.getAddress());

  await traning.safeMint('0x43780f67BaCC76069Edd6f5EAC1Ed3173876cC6b', 1);
  await traning.safeMint('0x43780f67BaCC76069Edd6f5EAC1Ed3173876cC6b', 2);
  await traning.safeMint('0x43780f67BaCC76069Edd6f5EAC1Ed3173876cC6b', 3);

  await traning.safeMint(owner.address, 4);
  await traning.safeMint(owner.address, 5);
  await traning.safeMint(owner.address, 6);

  await traning.setApprovalForAll(marketPlaceContract.target, true);


  await owner.sendTransaction({
    to: '0x43780f67BaCC76069Edd6f5EAC1Ed3173876cC6b',
    value: ethers.parseEther('10')
  })
  await marketPlaceContract.list(traning.target, 4, 100);
  await marketPlaceContract.list(traning.target, 5, 200);
  await marketPlaceContract.list(traning.target, 6, 300);


  await marketPlaceContract.connect(owner).cancelListing(traning.target, 4);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
