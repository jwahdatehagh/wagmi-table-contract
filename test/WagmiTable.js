const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_PRICE = ethers.utils.parseEther('0.2')
const CONTENT_ID = 'FOOBARBAZ'
const AARAALTO = '0x03C19A8432904f450cc90ba1892329deb43C8077'
const TWO_MINUTES = 120

describe('WagmiTable', function () {
  let
    WagmiTable,
    contract,
    owner,
    buyer,
    buyer2,
    addrs

  before(async () => {
    WagmiTable = await ethers.getContractFactory('WagmiTable')
  })

  beforeEach(async () => {
    saleStart = (await ethers.provider.getBlock('latest')).timestamp - TWO_MINUTES
    contract = await WagmiTable.deploy(100, DEFAULT_PRICE, CONTENT_ID, saleStart, AARAALTO)
    await contract.deployed();

    // Get user addresses
    [ owner, buyer, buyer2, ...addrs ] = await ethers.getSigners()
  })

  describe('Deployment', () => {
    it('should set the initial total supply', async () => {
      expect(await contract.totalSupply()).to.equal(100)
    })

    it('should mint the WAGMI token #0 to aarons address', async () => {
      expect(await contract.ownerOf(0)).to.equal(AARAALTO)
    })
  })

  describe('Token Prices', () => {
    it('should set the default token price', async () => {
      expect(await contract.defaultPrice()).to.equal(DEFAULT_PRICE)
    })

    it('should enable the owner to set a special price for a token', async () => {
      const specialPrice = ethers.utils.parseEther('1.618')

      await expect(contract.connect(owner).setTokenPrice(1, specialPrice))
        .to.not.be.reverted

      expect(await contract.priceForToken(1)).to.equal(specialPrice)
    })

    it('should enable the owner to set a special price for multiple tokens', async () => {
      const specialPrice = ethers.utils.parseEther('1.618')

      await expect(contract.connect(owner).setTokenPrices([1, 2, 10, 50], specialPrice))
        .to.not.be.reverted

      expect(await contract.priceForToken(1)).to.equal(specialPrice)
      expect(await contract.priceForToken(2)).to.equal(specialPrice)
      expect(await contract.priceForToken(10)).to.equal(specialPrice)
      expect(await contract.priceForToken(50)).to.equal(specialPrice)
    })
  })

  describe('Collection Metadata', () => {
    it('allows the owner to update the collection metadata', async () => {
      await expect(contract.connect(buyer).setCID('FOONEW'))
        .to.be.revertedWith('Ownable: caller is not the owner')

      await expect(contract.connect(owner).setCID('FOONEW'))
        .to.emit(contract, 'MetadataURIChanged')
        .withArgs(`ipfs://FOONEW`)
    })

    it('allows the owner to freeze the metadata', async () => {
      await contract.connect(owner).freeze()

      await expect(contract.connect(owner).setCID('FOONEW'))
        .to.be.revertedWith('Metadata already frozen')
    })

    it('allows the owner to create additional supply', async () => {
      await expect(contract.connect(owner).addToken('UPDATED_CID'))
        .to.emit(contract, 'SupplyChanged')
        .withArgs(101)
    })

    it('does not allow the owner to create additional supply when metadata is frozen', async () => {
      await contract.connect(owner).freeze()

      await expect(contract.connect(owner).addToken('UPDATED_CID'))
        .to.be.revertedWith('Metadata already frozen')

      await expect(contract.connect(owner).mintAdditionalTokens('UPDATED_CID', 5, owner.address))
        .to.be.revertedWith('Metadata already frozen')
    })
  })

  describe('Public Sale', () => {
    it('should not allow users to mint tokens before the sale starts', async () => {
      saleStart = (await ethers.provider.getBlock('latest')).timestamp + TWO_MINUTES
      contract = await WagmiTable.deploy(100, DEFAULT_PRICE, CONTENT_ID, saleStart, AARAALTO)
      await contract.deployed();

      await expect(contract.connect(buyer).mint(1, buyer.address, { value: DEFAULT_PRICE }))
        .to.be.revertedWith(`Sale hasn't started yet`)
    })

    it('should allow users to mint a token', async () => {
      await expect(contract.connect(buyer).mint(1, buyer.address, { value: DEFAULT_PRICE }))
        .to.emit(contract, 'Transfer')
        .withArgs(ethers.constants.AddressZero, buyer.address, 1)
    })

    it('should not allow users to mint a token that is out of range', async () => {
      await expect(contract.connect(buyer).mint(111, buyer.address))
        .to.be.revertedWith(`Token not available to mint`)
    })

    it('should not allow users to mint tokens that are already sold', async () => {
      await contract.connect(buyer).mint(50, buyer.address, { value: DEFAULT_PRICE })

      await expect(contract.connect(buyer2).mint(50, buyer2.address, { value: DEFAULT_PRICE }))
        .to.be.revertedWith(`ERC721: token already minted`)
    })

    it('should not allow to mint a token for less than its price', async () => {
      await expect(contract.connect(buyer).mint(1, buyer.address))
        .to.be.revertedWith(`Pay up, friend`)

      await expect(contract.connect(buyer).mint(2, buyer.address, { value: DEFAULT_PRICE.sub(10) }))
        .to.be.revertedWith(`Pay up, friend`)


      const specialPrice = ethers.utils.parseEther('1.618')
      await expect(contract.connect(owner).setTokenPrice(3, specialPrice))
        .to.not.be.reverted

      await expect(contract.connect(buyer).mint(3, buyer.address, { value: DEFAULT_PRICE }))
        .to.be.revertedWith(`Pay up, friend`)
    })

    it('allows the owner to withdraw funds from the contract', async () => {
      const ownerBalance = await ethers.provider.getBalance(owner.address)
      expect(await ethers.provider.getBalance(contract.address)).to.equal(0)

      await contract.connect(buyer).mint(1, buyer.address, { value: DEFAULT_PRICE })
      await contract.connect(buyer).mint(2, buyer.address, { value: DEFAULT_PRICE })
      await contract.connect(buyer).mint(3, buyer.address, { value: DEFAULT_PRICE })
      await contract.connect(buyer).mint(4, buyer.address, { value: DEFAULT_PRICE })


      expect(await ethers.provider.getBalance(contract.address)).to.equal(DEFAULT_PRICE.mul(4))

      // No funds sent to the owner yet.
      expect(await ethers.provider.getBalance(owner.address)).to.equal(ownerBalance)

      await expect(await contract.connect(owner).withdraw()).to.changeEtherBalance(owner, DEFAULT_PRICE.mul(4))

      // No funds left in contract
      expect(await ethers.provider.getBalance(contract.address)).to.equal(0)
    })
  })
})
