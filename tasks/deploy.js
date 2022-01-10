const TEN_MINUTES = 60 * 10

task('deploy', 'Deploys the smart contract')
  .setAction(async () => {
    const saleStart = (await ethers.provider.getBlock('latest')).timestamp + TEN_MINUTES
    const DEPLOYMENT_ARGUMENTS = [
      // Number of tokens
      process.env.NUMBER_OF_TOKENS,
      // The default price for all tokens
      process.env.DEFAULT_PRICE,
      // The IPFS hash of the collection
      process.env.IPFS_CONTENT_ID,
      // When the sale should start
      saleStart
    ]

    const WagmiTable = await ethers.getContractFactory('WagmiTable')
    const contract = await WagmiTable.deploy(...DEPLOYMENT_ARGUMENTS)

    console.log(`Deployed the contract with arguments [${DEPLOYMENT_ARGUMENTS.join(' ')}] at address "${contract.address}"`)
  })
