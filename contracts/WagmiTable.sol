// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@1001-digital/erc721-extensions/contracts/WithAdditionalMints.sol";
import "@1001-digital/erc721-extensions/contracts/WithSaleStart.sol";

contract WagmiTable is WithAdditionalMints, WithSaleStart {
    bool public frozen;

    uint256 public defaultPrice;
    mapping(uint256 => uint256) public priceForToken;

    constructor(
        uint256 _initialSupply,
        uint256 _defaultPrice,
        string memory _cid,
        uint256 _time,
        address _aaron
    )
        ERC721("WagmiTable", "WT")
        WithIPFSMetaData(_cid)
        WithLimitedSupply(_initialSupply)
        WithSaleStart(_time)
    {
        defaultPrice = _defaultPrice;

        _mint(_aaron, 0);
    }

    function mint(uint256 _tokenId, address _to)
        external payable
        withinSupply(_tokenId)
        meetsPrice(_tokenId)
        afterSaleStart
    {
        _mint(_to, _tokenId);
    }

    modifier withinSupply (uint256 _tokenId) {
        require(_tokenId < totalSupply(), "Token not available to mint");

        _;
    }

    modifier meetsPrice (uint256 _tokenId) {
        uint256 tokenPrice = priceForToken[_tokenId] > 0
            ? priceForToken[_tokenId]
            : defaultPrice;
        require(msg.value >= tokenPrice, "Pay up, friend");

        _;
    }

    function setTokenPrice(uint256 _tokenId, uint256 _price) external onlyOwner {
        priceForToken[_tokenId] = _price;
    }

    function setTokenPrices(uint256[] memory _tokenIds, uint256 _price) external onlyOwner {
        for (uint256 index = 0; index < _tokenIds.length; index++) {
            priceForToken[_tokenIds[index]] = _price;
        }
    }

    function freeze() external onlyOwner {
        frozen = true;
    }

    modifier unfrozen() {
        require(! frozen, "Metadata already frozen");

        _;
    }

    function setCID(string memory _cid) external onlyOwner unfrozen {
        _setCID(_cid);
    }

    function addTokens(string memory _cid, uint256 _count) public override onlyOwner unfrozen {
        super.addTokens(_cid, _count);
    }
}
