const { nowInSeconds } = require('../helpers/time')

task('setSaleStart', 'Updates the sale start on the contract')
  .addParam('address', 'The contract address to update')
  .addOptionalParam('time', 'The time to start the sale at')
  .setAction(async ({ address, time }) => {
    const saleStart = time || nowInSeconds()

    const WagmiTable = await ethers.getContractFactory('WagmiTable')
    const contract = await WagmiTable.attach(address)
    await contract.setSaleStart(saleStart)
  })
