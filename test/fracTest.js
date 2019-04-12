const Ae = require('@aeternity/aepp-sdk').Universal;
const Crypto = require('@aeternity/aepp-sdk').Crypto;

const config = {
  host: 'http://localhost:3001/',
  internalHost: 'http://localhost:3001/internal/',
  gas: 200000,
  ttl: 55
};

async function deployContract (contractName, ...params) {
    const [owner, gas, deployObj] = [params[0],params[1],params[2]];
    const contractSource = utils.readFileRelative(`./contracts/${contractName}.aes`, 'utf-8');
    const compileContract = await owner.contractCompile(contractSource, gas);
    const deployPromiseContract = await compileContract.deploy(deployObj);
    return deployPromiseContract;
}

function decodeContractAddress (contract) {
    const decoded58addres = Crypto.decodeBase58Check(contract.address.split('_')[1]).toString(
        'hex'
    );
    return `0x${decoded58addres}`;
}

async function callContract (contract, functionName, args, decodeType = 'int') {
    const result = await contract.call(functionName, args);
    const decodedResult = await result.decode(decodeType);
    return decodedResult.value;
}


describe('Contracts', () => {
    let owner;
    let FracTestContract;
    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet'
        });
    });
    describe('Deploy contracts', () => {
        it('should deploy frac test contract', async () => {
            const gas = {gas: config.gas};
            const deployObj = {options: { ttl: config.ttl }};
            FracTestContract = await deployContract('Frac', owner, gas, deployObj);
            assert(FracTestContract.hasOwnProperty('address'));
            assert(FracTestContract.hasOwnProperty('owner'));
        });
    });

  describe('Interact with contracts', () => {
      let addressFT;
      before (() => {
          addressFT = decodeContractAddress(FracTestContract);
      });
      it("Should buy some tokens", async () => {
          const args = {
              args: `()`,
              options: { ttl: 55, amount: 0 },
              abi: 'sophia'
          };
          const result = await callContract(FracTestContract, 'test', args);
      });

  });
});
