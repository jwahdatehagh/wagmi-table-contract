const { nowInSeconds } = require('../helpers/time')

task('setTokenPrices', 'Update the price for specific token IDs')
  .addParam('address', 'The contract address to update')
  .addOptionalParam('tokenIds', 'The token IDs to update - comma separated', '1,2,18')
  .addOptionalParam('price', 'The price for the tokens in WEI', '1618000000000000000')
  .setAction(async ({ address, tokenIds, price }) => {
    const WagmiTable = await ethers.getContractFactory('WagmiTable')
    const contract = await WagmiTable.attach(address)

    await contract.setTokenPrices(tokenIds.split(','), price)
  })
