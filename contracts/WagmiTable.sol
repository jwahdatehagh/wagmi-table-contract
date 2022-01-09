// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@1001-digital/erc721-extensions/contracts/WithAdditionalMints.sol";
import "@1001-digital/erc721-extensions/contracts/WithFrozenMetadata.sol";
import "@1001-digital/erc721-extensions/contracts/WithSaleStart.sol";
import "@1001-digital/erc721-extensions/contracts/WithTokenPrices.sol";

contract WagmiTable is
    WithAdditionalMints,
    WithFrozenMetadata,
    WithTokenPrices,
    WithSaleStart
{
    constructor(
        uint256 _initialSupply,
        uint256 _defaultPrice,
        string memory _cid,
        uint256 _time,
        address _aaron
    )
        ERC721("WagmiTable", "WT")
        WithSaleStart(_time)
        WithIPFSMetaData(_cid)
        WithTokenPrices(_defaultPrice)
        WithLimitedSupply(_initialSupply)
    {
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

    function addTokens(string memory _cid, uint256 _count)
        public override
        onlyOwner
        unfrozen
    {
        super.addTokens(_cid, _count);
    }

    function setCID(string memory _cid)
        external onlyOwner unfrozen
    {
        _setCID(_cid);
    }

    modifier withinSupply (uint256 _tokenId) {
        require(_tokenId < totalSupply(), "Token not available to mint");

        _;
    }
}
