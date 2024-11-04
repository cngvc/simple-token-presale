// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BrandToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
	constructor(
		string memory tokenName,
		string memory tokenSymbol,
		uint256 tokenAmount
	) ERC20(tokenName, tokenSymbol) Ownable(msg.sender) ERC20Permit(tokenName) {
		_mint(_msgSender(), tokenAmount);
	}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}
}
