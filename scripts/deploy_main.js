const fs = require("fs");
const colors = require("colors");
const { ethers } = require("hardhat");
const ERC20ABI =
    require("../artifacts/contracts/ERC20.sol/ERC20.json").abi;
const PresaleABI =
    require("../artifacts/contracts/presale.sol/Presale.json").abi;

async function main() {
    // get network
    var [owner] = await ethers.getSigners();

    let network = await owner.provider._networkPromise;

    //QE token deployment
    const ERC20TOKEN = await ethers.getContractFactory("ERC20");
    const tokenContract = await ERC20TOKEN.deploy("QEToken", "QE");
    await tokenContract.deployed();

    //presale deployment

    var terms = {
        vestingPrice: 30000 * 1000000, // 300000 QE/ETH // 1e6
        vestingPeriod: 20 * 24 * 3600, // 20 days
        price: 3000 * 1000000, // 3000 QE/ETH // 1e6
    };

    terms.vestingPeriod += Number((new Date() / 1000).toFixed(0));

    console.log(terms);

    const PresaleContract = await ethers.getContractFactory("Presale");
    const presaleContract = await PresaleContract.deploy(
        tokenContract.address,
        owner.address,
        terms
    );

    // deployment result
    var contractObject = {
        token: {
            address: tokenContract.address,
            abi: ERC20ABI,
        },
        presale: {
            address: presaleContract.address,
            abi: PresaleABI,
        },
    };

    fs.writeFileSync(
        `./build/${network.chainId}.json`,
        JSON.stringify(contractObject, undefined, 4)
    );
}

main()
    .then(() => {
        console.log("complete".green);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
