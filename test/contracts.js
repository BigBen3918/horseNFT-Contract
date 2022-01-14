const { expect } = require("chai");
const fs = require("fs");
const { ethers } = require("hardhat");
const ERC20ABI = require("../artifacts/contracts/dexfactory.sol/IERC20.json").abi;
const PresaleABI =
	require("../artifacts/contracts/presale.sol/Presale.json").abi;

const { delay, fromBigNum, toBigNum } = require("./utils.js")

var owner;
var network;

var tokenContract;
var presaleContract;

var userWallet;


describe("deploy contracts", function () {
	it("Create account", async function () {
		[owner] = await ethers.getSigners();

		network = await owner.provider._networkPromise;

		userWallet = ethers.Wallet.createRandom();
		userWallet = userWallet.connect(ethers.provider);
		var tx = await owner.sendTransaction({
			to: userWallet.address,
			value: ethers.utils.parseUnits("100", 18)
		});
		await tx.wait();
	});

	it("deploy contracts", async function () {
		//QE token deployment
		const ERC20TOKEN = await ethers.getContractFactory("ERC20");
		tokenContract = await ERC20TOKEN.deploy("QEToken", "QE");
		await tokenContract.deployed();

		//presale deployment
		var terms = {
			vestingPrice: 30000 * 1000000, // 300000 QE/ETH // 1e6
			vestingPeriod: 20 * 24 * 3600, // 20 days
			price: 3000 * 1000000 // 3000 QE/ETH // 1e6
		}
		const PresaleContract = await ethers.getContractFactory("Presale");
		presaleContract = await PresaleContract.deploy(tokenContract.address, owner.address, terms);
	})
});


describe("contracts test", function () {
	it("transfer", async () => {
		var tx = await tokenContract.transfer(presaleContract.address, toBigNum("1000000", 18));
		await tx.wait();
	});

	it("buy", async () => {
		var initAmount = await tokenContract.balanceOf(owner.address);
		var tx = await presaleContract.buy({ value: toBigNum("1", 18) });
		await tx.wait();
		var cAmount = await tokenContract.balanceOf(owner.address);
		expect(cAmount.sub(initAmount)).to.be.equal(toBigNum("30000", 18));
	})
});


describe("deployment result", function () {
	it("deployment result", async function () {
		// deployment result
		var contractObject = {
			token: {
				address: tokenContract.address,
				abi: ERC20ABI
			},
			presale: {
				address: presaleContract.address,
				abi: PresaleABI
			}
		}

		fs.writeFileSync(
			`./build/${network.chainId}.json`,
			JSON.stringify(contractObject, undefined, 4)
		);
	});
});





