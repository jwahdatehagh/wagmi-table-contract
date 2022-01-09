// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@1001-digital/erc721-extensions/contracts/WithAdditionalMints.sol";
import "@1001-digital/erc721-extensions/contracts/WithFreezableMetadata.sol";
import "@1001-digital/erc721-extensions/contracts/WithSaleStart.sol";
import "@1001-digital/erc721-extensions/contracts/WithTokenPrices.sol";
import "@1001-digital/erc721-extensions/contracts/WithWithdrawals.sol";

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
//                                                                                               //
//   __      __  ______  ____             ______      ______ ______  ____    __      ____        //
//  /\ \  __/\ \/\  _  \/\  _`\   /'\_/`\/\__  _\    /\__  _/\  _  \/\  _`\ /\ \    /\  _`\      //
//  \ \ \/\ \ \ \ \ \L\ \ \ \L\_\/\      \/_/\ \/    \/_/\ \\ \ \L\ \ \ \L\ \ \ \   \ \ \L\_\    //
//   \ \ \ \ \ \ \ \  __ \ \ \L_L\ \ \__\ \ \ \ \       \ \ \\ \  __ \ \  _ <\ \ \  _\ \  _\L    //
//    \ \ \_/ \_\ \ \ \/\ \ \ \/, \ \ \_/\ \ \_\ \__     \ \ \\ \ \/\ \ \ \L\ \ \ \L\ \ \ \L\ \  //
//     \ `\___x___/\ \_\ \_\ \____/\ \_\\ \_\/\_____\     \ \_\\ \_\ \_\ \____/\ \____/\ \____/  //
//      '\/__//__/  \/_/\/_/\/___/  \/_/ \/_/\/_____/      \/_/ \/_/\/_/\/___/  \/___/  \/___/   //
//                                                                                               //
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
//                              trust the process · by aaraalto.eth                              //
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
contract WagmiTable is
    WithAdditionalMints,
    WithFreezableMetadata,
    WithTokenPrices,
    WithWithdrawals,
    WithSaleStart
{
    /// Initialize the WagmiTable Contract
    /// @param _initialSupply The initial supply of the collection
    /// @param _defaultPrice The default price for all tokens
    /// @param _cid The content identifyer for the collection
    /// @param _time The sale start time
    /// @param _aaron The artist address
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

    /// Mint a new WAGMI TABLE token
    /// @param _tokenId The token to mint
    /// @param _to The address of the recipient of the token
    function mint(uint256 _tokenId, address _to)
        external payable
        withinSupply(_tokenId)
        meetsPrice(_tokenId)
        afterSaleStart
    {
        _mint(_to, _tokenId);
    }

    /// Add new token supply, but only if the collection isn't frozen yet
    /// @param _cid The new IFPS hash (content identifyer) of the collection
    /// @param _count The number of tokens to create
    function addTokens(string memory _cid, uint256 _count)
        public override
        onlyOwner
        unfrozen
    {
        super.addTokens(_cid, _count);
    }

    /// Update the IPFS hash of the collection
    /// @param _cid The new IFPS hash (content identifyer) of the collection
    function setCID(string memory _cid)
        external onlyOwner unfrozen
    {
        _setCID(_cid);
    }

    /// Check whether we are exceeding the token supply.
    /// @param _tokenId The tokenID to check against the supply.
    modifier withinSupply (uint256 _tokenId) {
        require(_tokenId < totalSupply(), "Token not available to mint");

        _;
    }
}
