//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

error LowBalance();
error EthPaymentFailed();
error TokenTransferFailed();
error NoClaimableAmount();
error PresaleTokenAddressNotSet();
error NotEnoughTokensInTheContract();
error ClaimIsNotEnable();
error PromoCodeUsageLimitReached();
error ZeroTokenAddress();
error ZeroPrice();
error ZeroTokensToSell();
error ZeroHardcap();
error PositiveBonusToken();
error PresaleDoesNotExist();
error PresaleHasBeenPaused();
error PresaleIsNotActiveYet();
error AccountIsBlackListed();
error LessThanMinAmount();
error MakeSureToAddEnoughAllowance();
error TokenPaymentFailed();
error NothingToClaim();
error AlreadyClaimed();
error UserNotAParticipant();
error PleaseWaitTillNextClaim();
error WaitForNextClaim();
error AlreadyPaused();
error NotPaused();
error InvalidPresaleId();
error PresaleNotActive();
error InvalidSaleAmount();
error PromoCodeDoesNotExist();
error CodeMustNotBeEmpty();
error UsageLimitMustBeGreaterThanZero();
error InvalidDiscountPercentage();
error StageSoldout();

interface Aggregator {
	function latestRoundData()
		external
		view
		returns (
			uint80 roundId,
			int256 answer,
			uint256 startedAt,
			uint256 updatedAt,
			uint80 answeredInRound
		);
}

contract BrandPresale is ReentrancyGuard, Ownable {
	using Address for address;

	uint256 public overallRaised;
	uint256 public presaleId;
	address public fundReceiver;
	uint256 public uniqueBuyers;

	uint256 private USDT_MULTIPLIER;
	uint256 private ETH_MULTIPLIER;

	struct PresaleData {
		uint256 startTime;
		uint256 endTime;
		uint256 price; // tokens for 1$
		uint256 nextStagePrice; // next tokens for 1$
		uint256 sold;
		uint256 tokensToSell;
		uint256 usdtHardcap;
		uint256 amountRaised;
		bool active;
		bool isEnableClaim;
		uint256 soldBonusTokens;
		uint256 extraBonusTokens;
	}

	struct PromoCode {
		uint256 usageLimit;
		uint256 usageCount;
		uint256 discountPercentage;
		bool active;
	}

	struct VestingData {
		uint256 vestingStartTime;
		uint256 initialClaimPercent;
		uint256 vestingTime;
		uint256 vestingPercentage;
		uint256 totalClaimCycles;
	}

	struct UserData {
		uint256 investedAmount;
		uint256 claimAt;
		uint256 claimAbleAmount;
		uint256 claimedVestingAmount;
		uint256 claimedAmount;
		uint256 claimCount;
		uint256 activePercentAmount;
	}

	IERC20Metadata public USDTInterface;
	Aggregator internal aggregatorInterface;

	mapping(uint256 => bool) public paused;
	mapping(uint256 => PresaleData) public presale;
	mapping(uint256 => VestingData) public vesting;
	mapping(address => mapping(uint256 => UserData)) public userClaimData;
	mapping(address => bool) public isExcludeMinToken;
	mapping(address => bool) public isBlackList;
	mapping(address => bool) public isExist;
	mapping(string => PromoCode) public promoCodes;
	string[] public promoCodeKeys;

	uint256 public minTokenToBuy;
	uint256 public currentSale;
	address public saleToken;

	event PromoCodeCreated(
		string code,
		uint256 usageLimit,
		uint256 discountPercentage
	);

	event PresaleCreated(
		uint256 indexed _id,
		uint256 _totalTokens,
		uint256 _startTime,
		uint256 _endTime
	);

	event TokensBought(
		address indexed user,
		uint256 indexed id,
		address indexed purchaseToken,
		uint256 tokensBought,
		uint256 amountPaid,
		uint256 timestamp
	);

	event PresalePaused(uint256 indexed id, uint256 timestamp);
	event PresaleUnpaused(uint256 indexed id, uint256 timestamp);

	constructor(
		address _oracle,
		address _usdt,
		uint256 _minTokenToBuy
	) Ownable(msg.sender) {
		aggregatorInterface = Aggregator(_oracle);
		saleToken = address(0);
		minTokenToBuy = _minTokenToBuy;
		USDTInterface = IERC20Metadata(_usdt);
		ETH_MULTIPLIER = (10 ** 18);
		USDT_MULTIPLIER = (10 ** 6);
		fundReceiver = msg.sender;
	}

	function createPresale(
		uint256 _price,
		uint256 _nextStagePrice,
		uint256 _tokensToSell,
		uint256 _usdtHardcap,
		uint256 _extraBonusTokens
	) external onlyOwner {
		if (_price <= 0) {
			revert ZeroPrice();
		}
		if (_tokensToSell <= 0) {
			revert ZeroTokensToSell();
		}

		presaleId++;

		presale[presaleId] = PresaleData(
			0,
			0,
			_price,
			_nextStagePrice,
			0,
			_tokensToSell,
			_usdtHardcap,
			0,
			false,
			false,
			0,
			_extraBonusTokens
		);

		emit PresaleCreated(presaleId, _tokensToSell, 0, 0);
	}

	function changePresaleStage(uint256 _id) internal onlyOwner {
		if (presale[_id].tokensToSell > 0) {
			if (currentSale != 0) {
				presale[currentSale].endTime = block.timestamp;
				presale[currentSale].active = false;
			}
			presale[_id].startTime = block.timestamp;
			presale[_id].active = true;
			currentSale = _id;
		}
	}

	function setPresaleStage(uint256 _id) public onlyOwner {
		if (presale[_id].tokensToSell <= 0) {
			revert PresaleDoesNotExist();
		}
		changePresaleStage(_id);
	}

	function setPresaleVesting(
		uint256[] memory _id,
		uint256[] memory vestingStartTime,
		uint256[] memory _initialClaimPercent,
		uint256[] memory _vestingTime,
		uint256[] memory _vestingPercentage
	) public onlyOwner {
		for (uint256 i = 0; i < _id.length; i++) {
			vesting[_id[i]] = VestingData(
				vestingStartTime[i],
				_initialClaimPercent[i],
				_vestingTime[i],
				_vestingPercentage[i],
				(1000 - _initialClaimPercent[i]) / _vestingPercentage[i]
			);
		}
	}

	function updatePresaleVesting(
		uint256 _id,
		uint256 _vestingStartTime,
		uint256 _initialClaimPercent,
		uint256 _vestingTime,
		uint256 _vestingPercentage
	) public onlyOwner {
		vesting[_id].vestingStartTime = _vestingStartTime;
		vesting[_id].initialClaimPercent = _initialClaimPercent;
		vesting[_id].vestingTime = _vestingTime;
		vesting[_id].vestingPercentage = _vestingPercentage;
		vesting[_id].totalClaimCycles =
			(100 - _initialClaimPercent) /
			_vestingPercentage;
	}

	uint256 initialClaimPercent;
	uint256 vestingTime;
	uint256 vestingPercentage;
	uint256 totalClaimCycles;

	function enableClaim(uint256 _id, bool _status) public onlyOwner {
		presale[_id].isEnableClaim = _status;
	}

	function updatePresale(
		uint256 _id,
		uint256 _price,
		uint256 _nextStagePrice,
		uint256 _tokensToSell,
		uint256 _hardcap,
		bool isClaimable,
		uint256 _extraBonusTokens
	) external onlyOwner {
		if (_price <= 0) {
			revert ZeroPrice();
		}
		if (_tokensToSell <= 0) {
			revert ZeroTokensToSell();
		}
		if (_hardcap <= 0) {
			revert ZeroHardcap();
		}
		if (_extraBonusTokens < 0) {
			revert PositiveBonusToken();
		}
		presale[_id].price = _price;
		presale[_id].nextStagePrice = _nextStagePrice;
		presale[_id].tokensToSell = _tokensToSell;
		presale[_id].usdtHardcap = _hardcap;
		presale[_id].isEnableClaim = isClaimable;
		presale[_id].extraBonusTokens = _extraBonusTokens;
	}

	function changeFundWallet(address _wallet) external onlyOwner {
		if (_wallet == address(0)) {
			revert ZeroTokenAddress();
		}
		fundReceiver = _wallet;
	}

	function changeUSDTToken(address _newAddress) external onlyOwner {
		if (_newAddress == address(0)) {
			revert ZeroTokenAddress();
		}
		USDTInterface = IERC20Metadata(_newAddress);
	}

	function pausePresale(uint256 _id) external checkPresaleId(_id) onlyOwner {
		if (paused[_id]) {
			revert AlreadyPaused();
		}
		paused[_id] = true;
		emit PresalePaused(_id, block.timestamp);
	}

	function unPausePresale(
		uint256 _id
	) external checkPresaleId(_id) onlyOwner {
		if (!paused[_id]) {
			revert NotPaused();
		}
		paused[_id] = false;
		emit PresaleUnpaused(_id, block.timestamp);
	}

	function getLatestPrice() public view returns (uint256) {
		(, int256 price, , , ) = aggregatorInterface.latestRoundData();
		price = (price * (10 ** 10));
		return uint256(price);
	}

	modifier checkPresaleId(uint256 _id) {
		if (_id <= 0 || _id != currentSale) {
			revert InvalidPresaleId();
		}
		_;
	}

	modifier checkSaleState(uint256 _id, uint256 amount) {
		if (!presale[_id].active) {
			revert PresaleNotActive();
		}
		if (amount <= 0) {
			revert InvalidSaleAmount();
		}
		if (presale[_id].sold >= presale[_id].tokensToSell) {
			revert StageSoldout();
		}
		_;
		if (presale[_id].sold >= presale[_id].tokensToSell) {
			changePresaleStage(currentSale + 1);
		}
	}

	function excludeAccountFromMinBuy(
		address _user,
		bool _status
	) external onlyOwner {
		isExcludeMinToken[_user] = _status;
	}

	function min(uint256 a, uint256 b) internal pure returns (uint256) {
		return a <= b ? a : b;
	}

	function buyWithUSDT(
		uint256 usdAmount,
		string memory promoCode
	)
		external
		checkPresaleId(currentSale)
		checkSaleState(currentSale, usdtToTokens(currentSale, usdAmount))
		nonReentrant
		returns (bool)
	{
		if (paused[currentSale]) {
			revert PresaleHasBeenPaused();
		}
		if (!presale[currentSale].active) {
			revert PresaleIsNotActiveYet();
		}
		if (isBlackList[msg.sender]) {
			revert AccountIsBlackListed();
		}

		if (!isExist[msg.sender]) {
			isExist[msg.sender] = true;
			uniqueBuyers++;
		}
		uint256 tokens = usdtToTokens(currentSale, usdAmount);
		uint256 shouldBonusTokens = 0;

		if (bytes(promoCode).length > 0) {
			if (!promoCodes[promoCode].active) {
				revert PromoCodeDoesNotExist();
			}
			if (
				promoCodes[promoCode].usageCount >=
				promoCodes[promoCode].usageLimit
			) {
				revert PromoCodeUsageLimitReached();
			}
			promoCodes[promoCode].usageCount += ETH_MULTIPLIER;
			shouldBonusTokens = calculateShouldBonusTokens(promoCode, tokens);
		}

		if (isExcludeMinToken[msg.sender] == false && tokens < minTokenToBuy) {
			revert LessThanMinAmount();
		}

		presale[currentSale].sold += tokens;
		presale[currentSale].soldBonusTokens += shouldBonusTokens;
		presale[currentSale].amountRaised += usdAmount;
		overallRaised += usdAmount;

		if (userClaimData[_msgSender()][currentSale].claimAbleAmount > 0) {
			userClaimData[_msgSender()][currentSale]
				.claimAbleAmount += (tokens + shouldBonusTokens);
			userClaimData[_msgSender()][currentSale]
				.investedAmount += usdAmount;
		} else {
			userClaimData[_msgSender()][currentSale] = UserData(
				usdAmount,
				0,
				tokens + shouldBonusTokens,
				0,
				0,
				0,
				0
			);
		}

		uint256 ourAllowance = USDTInterface.allowance(
			_msgSender(),
			address(this)
		);
		if (usdAmount > ourAllowance) {
			revert MakeSureToAddEnoughAllowance();
		}
		(bool success, ) = address(USDTInterface).call(
			abi.encodeWithSignature(
				"transferFrom(address,address,uint256)",
				_msgSender(),
				fundReceiver,
				usdAmount
			)
		);
		if (!success) {
			revert TokenPaymentFailed();
		}
		emit TokensBought(
			_msgSender(),
			currentSale,
			address(USDTInterface),
			tokens,
			usdAmount,
			block.timestamp
		);
		return true;
	}

	function changeClaimAddress(
		address _oldAddress,
		address _newWallet
	) public onlyOwner {
		for (uint256 i = 1; i < presaleId; i++) {
			if (!isExist[_oldAddress]) {
				revert UserNotAParticipant();
			}
			userClaimData[_newWallet][i].claimAbleAmount = userClaimData[
				_oldAddress
			][i].claimAbleAmount;
			userClaimData[_oldAddress][i].claimAbleAmount = 0;
		}
		isExist[_oldAddress] = false;
		isExist[_newWallet] = true;
	}

	function blackListUser(address _user, bool _value) public onlyOwner {
		isBlackList[_user] = _value;
	}

	function buyWithEth(
		string memory promoCode
	)
		external
		payable
		checkPresaleId(currentSale)
		checkSaleState(currentSale, ethToTokens(currentSale, msg.value))
		nonReentrant
		returns (bool)
	{
		uint256 usdAmount = (msg.value * getLatestPrice() * USDT_MULTIPLIER) /
			(ETH_MULTIPLIER * ETH_MULTIPLIER);

		if (!presale[currentSale].active) {
			revert PresaleIsNotActiveYet();
		}
		if (paused[currentSale]) {
			revert PresaleHasBeenPaused();
		}
		if (isBlackList[msg.sender]) {
			revert AccountIsBlackListed();
		}

		uint256 tokens = usdtToTokens(currentSale, usdAmount);
		uint256 shouldBonusTokens = 0;

		if (isExcludeMinToken[msg.sender] == false && tokens < minTokenToBuy) {
			revert LessThanMinAmount();
		}

		if (bytes(promoCode).length > 0) {
			if (!promoCodes[promoCode].active) {
				revert PromoCodeDoesNotExist();
			}
			if (
				promoCodes[promoCode].usageCount >=
				promoCodes[promoCode].usageLimit
			) {
				revert PromoCodeUsageLimitReached();
			}
			promoCodes[promoCode].usageCount += ETH_MULTIPLIER;
			shouldBonusTokens = calculateShouldBonusTokens(promoCode, tokens);
		}
		presale[currentSale].sold += tokens;
		presale[currentSale].soldBonusTokens += shouldBonusTokens;
		presale[currentSale].amountRaised += usdAmount;
		overallRaised += usdAmount;
		if (userClaimData[_msgSender()][currentSale].claimAbleAmount > 0) {
			userClaimData[_msgSender()][currentSale]
				.claimAbleAmount += (tokens + shouldBonusTokens);
			userClaimData[_msgSender()][currentSale]
				.investedAmount += usdAmount;
		} else {
			userClaimData[_msgSender()][currentSale] = UserData(
				usdAmount,
				0, // Last claimed at
				tokens + shouldBonusTokens, // total tokens + bonus to be claimed
				0, // vesting claimed amount
				0, // claimed amount
				0, // claim count
				0 // vesting percent
			);
		}

		sendValue(payable(fundReceiver), msg.value);
		emit TokensBought(
			_msgSender(),
			currentSale,
			address(0),
			tokens,
			msg.value,
			block.timestamp
		);
		return true;
	}

	function ethBuyHelper(
		uint256 _id,
		uint256 amount
	) external view returns (uint256 ethAmount) {
		uint256 usdPrice = (amount * presale[_id].price);
		ethAmount =
			(usdPrice * ETH_MULTIPLIER) /
			(getLatestPrice() * 10 ** IERC20Metadata(saleToken).decimals());
	}

	function usdtBuyHelper(
		uint256 _id,
		uint256 amount
	) external view returns (uint256 usdPrice) {
		usdPrice =
			(amount * presale[_id].price) /
			10 ** IERC20Metadata(saleToken).decimals();
	}

	function ethToTokens(
		uint256 _id,
		uint256 amount
	) public view returns (uint256 _tokens) {
		uint256 usdAmount = (amount * getLatestPrice() * USDT_MULTIPLIER) /
			(ETH_MULTIPLIER * ETH_MULTIPLIER);
		_tokens = usdtToTokens(_id, usdAmount);
	}

	function usdtToTokens(
		uint256 _id,
		uint256 amount
	) public view returns (uint256 _tokens) {
		_tokens = (amount * presale[_id].price) / USDT_MULTIPLIER;
	}

	function sendValue(address payable recipient, uint256 amount) internal {
		if (address(this).balance < amount) {
			revert LowBalance();
		}

		(bool success, ) = recipient.call{ value: amount }("");
		if (!success) {
			revert EthPaymentFailed();
		}
	}

	function claimableAmount(
		address user,
		uint256 _id
	) public view returns (uint256) {
		UserData memory _user = userClaimData[user][_id];
		if (_user.claimAbleAmount <= 0) {
			revert NothingToClaim();
		}
		uint256 amount = _user.claimAbleAmount;
		if (amount <= 0) {
			revert AlreadyClaimed();
		}
		return amount;
	}

	function claimAmount(uint256 _id) public returns (bool) {
		if (!isExist[_msgSender()]) {
			revert UserNotAParticipant();
		}
		uint256 amount = claimableAmount(msg.sender, _id);
		if (amount <= 0) {
			revert NoClaimableAmount();
		}
		if (isBlackList[msg.sender]) {
			revert AccountIsBlackListed();
		}
		if (saleToken == address(0)) {
			revert PresaleTokenAddressNotSet();
		}
		if (amount > IERC20(saleToken).balanceOf(address(this))) {
			revert NotEnoughTokensInTheContract();
		}
		if (!presale[_id].isEnableClaim) {
			revert ClaimIsNotEnable();
		}
		uint256 transferAmount;
		if (userClaimData[msg.sender][_id].claimCount == 0) {
			transferAmount =
				(amount * (vesting[_id].initialClaimPercent)) /
				1000;
			userClaimData[msg.sender][_id].activePercentAmount =
				(amount * vesting[_id].vestingPercentage) /
				1000;
			bool status = IERC20(saleToken).transfer(
				msg.sender,
				transferAmount
			);
			if (!status) {
				revert TokenTransferFailed();
			}
			userClaimData[msg.sender][_id].claimAbleAmount -= transferAmount;
			userClaimData[msg.sender][_id].claimedAmount += transferAmount;
			userClaimData[msg.sender][_id].claimCount++;
		} else if (
			userClaimData[msg.sender][_id].claimAbleAmount >
			userClaimData[msg.sender][_id].activePercentAmount
		) {
			uint256 duration = block.timestamp - vesting[_id].vestingStartTime;
			uint256 multiplier = duration / vesting[_id].vestingTime;
			if (multiplier > vesting[_id].totalClaimCycles) {
				multiplier = vesting[_id].totalClaimCycles;
			}
			uint256 _amount = multiplier *
				userClaimData[msg.sender][_id].activePercentAmount;
			transferAmount =
				_amount -
				userClaimData[msg.sender][_id].claimedVestingAmount;
			if (transferAmount <= 0) {
				revert PleaseWaitTillNextClaim();
			}
			bool status = IERC20(saleToken).transfer(
				msg.sender,
				transferAmount
			);
			if (!status) {
				revert TokenTransferFailed();
			}
			userClaimData[msg.sender][_id].claimAbleAmount -= transferAmount;
			userClaimData[msg.sender][_id]
				.claimedVestingAmount += transferAmount;
			userClaimData[msg.sender][_id].claimedAmount += transferAmount;
			userClaimData[msg.sender][_id].claimCount++;
		} else {
			uint256 duration = block.timestamp - vesting[_id].vestingStartTime;
			uint256 multiplier = duration / vesting[_id].vestingTime;
			if (multiplier > vesting[_id].totalClaimCycles + 1) {
				transferAmount = userClaimData[msg.sender][_id].claimAbleAmount;
				if (transferAmount <= 0) {
					revert PleaseWaitTillNextClaim();
				}
				bool status = IERC20(saleToken).transfer(
					msg.sender,
					transferAmount
				);
				if (!status) {
					revert TokenTransferFailed();
				}
				userClaimData[msg.sender][_id]
					.claimAbleAmount -= transferAmount;
				userClaimData[msg.sender][_id].claimedAmount += transferAmount;
				userClaimData[msg.sender][_id]
					.claimedVestingAmount += transferAmount;
				userClaimData[msg.sender][_id].claimCount++;
			} else {
				revert WaitForNextClaim();
			}
		}
		return true;
	}

	function withdrawTokens(address _token, uint256 amount) external onlyOwner {
		IERC20(_token).transfer(fundReceiver, amount);
	}

	function withdrawContractFunds(uint256 amount) external onlyOwner {
		sendValue(payable(fundReceiver), amount);
	}

	function changeTokenToSell(address _token) public onlyOwner {
		saleToken = _token;
	}

	function changeMinTokenToBuy(uint256 _amount) public onlyOwner {
		minTokenToBuy = _amount;
	}

	function changeOracleAddress(address _oracle) public onlyOwner {
		aggregatorInterface = Aggregator(_oracle);
	}

	function blockStamp() public view returns (uint256) {
		return block.timestamp;
	}

	function validatePromoCode(
		string memory code
	) external view returns (bool, uint256) {
		return (
			promoCodes[code].active &&
				promoCodes[code].usageCount < promoCodes[code].usageLimit,
			promoCodes[code].discountPercentage
		);
	}

	function createPromoCode(
		string memory code,
		uint256 usageLimit,
		uint256 discountPercentage
	) external onlyOwner {
		if (bytes(code).length == 0) {
			revert CodeMustNotBeEmpty();
		}
		if (usageLimit <= 0) {
			revert UsageLimitMustBeGreaterThanZero();
		}
		if (discountPercentage <= 0) {
			revert InvalidDiscountPercentage();
		}
		promoCodes[code] = PromoCode(usageLimit, 0, discountPercentage, true);
		promoCodeKeys.push(code);

		emit PromoCodeCreated(code, usageLimit, discountPercentage);
	}

	function updatePromoCode(
		string memory code,
		uint256 usageLimit,
		uint256 discountPercentage,
		bool isActive
	) external onlyOwner {
		if (bytes(code).length == 0) {
			revert CodeMustNotBeEmpty();
		}
		if (usageLimit <= 0) {
			revert UsageLimitMustBeGreaterThanZero();
		}
		if (discountPercentage <= 0) {
			revert InvalidDiscountPercentage();
		}
		PromoCode storage promo = promoCodes[code];
		if (promo.usageLimit <= 0) {
			revert PromoCodeDoesNotExist();
		}

		promo.usageLimit = usageLimit;
		promo.discountPercentage = discountPercentage;
		promo.active = isActive;
	}

	function disablePromoCode(string memory code) external onlyOwner {
		if (promoCodes[code].usageLimit == 0) {
			revert PromoCodeDoesNotExist();
		}
		promoCodes[code].active = false;
	}

	function getActivePromoCodes() external view returns (string[] memory) {
		uint256 numberOfActiveCodes = 0;
		for (uint256 i = 0; i < promoCodeKeys.length; i++) {
			if (promoCodes[promoCodeKeys[i]].active) {
				numberOfActiveCodes++;
			}
		}
		string[] memory activeCodes = new string[](numberOfActiveCodes);
		uint256 currentIndex = 0;
		for (uint256 i = 0; i < promoCodeKeys.length; i++) {
			if (promoCodes[promoCodeKeys[i]].active) {
				activeCodes[currentIndex] = promoCodeKeys[i];
				currentIndex++;
			}
		}

		return activeCodes;
	}

	function calculateShouldBonusTokens(
		string memory _promoCode,
		uint256 _tokens
	) internal view returns (uint256 shouldBonusTokens) {
		uint256 extraBonusTokens = presale[currentSale].extraBonusTokens;
		uint256 soldBonusTokens = presale[currentSale].soldBonusTokens;
		uint256 discountPercentage = promoCodes[_promoCode].discountPercentage;
		shouldBonusTokens = extraBonusTokens - soldBonusTokens;
		uint256 bonusFromPromoCode = (_tokens *
			(discountPercentage / ETH_MULTIPLIER)) / 100;
		shouldBonusTokens = min(shouldBonusTokens, bonusFromPromoCode);
	}
}
