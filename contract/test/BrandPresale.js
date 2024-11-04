const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("BrandPresale", function () {
	let contract
	let owner
	let user

	const USDT_MULTIPLIER = 10 ** 6
	const ETH_MULTIPLIER = 10 ** 18

	const _price = ethers.parseEther(`${0.03 * USDT_MULTIPLIER}`)
	const _nextPrice = ethers.parseEther(`${0.04 * USDT_MULTIPLIER}`)
	const _tokenToSell = ethers.parseEther(`${15_000_000}`)
	const _extraBonusTokens = ethers.parseEther(`${500_000}`)

	const _usdHardcap = BigInt(450000 * USDT_MULTIPLIER)

	const usageLimit = ethers.parseEther(`${100}`)
	const discountPercentage = ethers.parseEther(`${50}`)

	beforeEach(async function () {
		const signers = await ethers.getSigners()
		owner = signers[0]
		user = signers[1]
		const randomAddress = await ethers.Wallet.createRandom()
		const Contract = await ethers.getContractFactory("BrandPresale")
		contract = await Contract.deploy(randomAddress, randomAddress, 0)
	})

	it("Should create a presale", async function () {
		await contract.connect(owner).createPresale(_price, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)
		const presaleData = await contract.presale(1)
		expect(presaleData.price).to.equal(_price)
		expect(presaleData.nextStagePrice).to.equal(_nextPrice)
		expect(presaleData.tokensToSell).to.equal(_tokenToSell)
		expect(presaleData.usdtHardcap).to.equal(_usdHardcap)
	})

	it("Should set presale stage", async function () {
		await contract.connect(owner).createPresale(_price, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)
		await contract.connect(owner).setPresaleStage(1)
		const presaleData = await contract.presale(1)

		expect(presaleData.price).to.equal(_price)
		expect(presaleData.nextStagePrice).to.equal(_nextPrice)
		expect(presaleData.tokensToSell).to.equal(_tokenToSell)
		expect(presaleData.usdtHardcap).to.equal(_usdHardcap)

		expect(presaleData.startTime).to.not.equal(0)
		expect(presaleData.active).to.equal(true)
	})

	it("Should change fund wallet", async function () {
		const newWallet = await ethers.Wallet.createRandom()
		await contract.connect(owner).changeFundWallet(newWallet.address)
		const fundReceiver = await contract.fundReceiver()
		expect(fundReceiver).to.equal(newWallet.address)
	})

	it("Should change USDT token", async function () {
		const newUsdtToken = await ethers.Wallet.createRandom()
		await contract.connect(owner).changeUSDTToken(newUsdtToken.address)
		const usdtToken = await contract.USDTInterface()
		expect(usdtToken).to.equal(newUsdtToken.address)
	})

	it("Should pause and unpause presale", async function () {
		await contract.connect(owner).createPresale(_price, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)
		await contract.connect(owner).setPresaleStage(1)
		expect(await contract.paused(1)).to.equal(false)

		await contract.connect(owner).pausePresale(1)
		expect(await contract.paused(1)).to.equal(true)

		await contract.connect(owner).unPausePresale(1)
		expect(await contract.paused(1)).to.equal(false)
	})

	it("Should exclude account from min buy", async function () {
		await contract.connect(owner).excludeAccountFromMinBuy(user.address, true)
		const isExcluded = await contract.isExcludeMinToken(user.address)
		expect(isExcluded).to.equal(true)
	})

	it("Should blacklist user", async function () {
		await contract.connect(owner).blackListUser(user.address, true)
		const isBlacklisted = await contract.isBlackList(user.address)
		expect(isBlacklisted).to.equal(true)
	})

	it("Should change token to sell", async function () {
		const newTokenToSell = await ethers.Wallet.createRandom()
		await contract.connect(owner).changeTokenToSell(newTokenToSell.address)
		const tokenToSell = await contract.saleToken()
		expect(tokenToSell).to.equal(newTokenToSell.address)
	})

	it("Should edit min token to buy", async function () {
		await contract.connect(owner).changeMinTokenToBuy(500)
		const minTokenToBuy = await contract.minTokenToBuy()
		expect(minTokenToBuy).to.equal(500)
	})

	it("Should enable claim", async function () {
		await contract.connect(owner).createPresale(_price, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)
		await contract.connect(owner).enableClaim(1, true)
		const isClaimEnabled = (await contract.presale(1)).isEnableClaim
		expect(isClaimEnabled).to.equal(true)
	})

	it("Should create and validate a promo code", async function () {
		const promoCode = "PROMO"
		await contract.createPromoCode(promoCode, usageLimit, discountPercentage)

		const [isValid] = await contract.validatePromoCode(promoCode)
		expect(isValid).to.be.true

		const activePromoCodes = await contract.getActivePromoCodes()
		expect(activePromoCodes).to.include(promoCode)
	})

	it("Should update and disable a promo code", async function () {
		const promoCode = "PROMO"
		await contract.createPromoCode(promoCode, usageLimit, discountPercentage)

		const newUsageLimit = ethers.parseEther(`${50}`)
		const newDiscountPercentage = ethers.parseEther(`${15}`)
		await contract.updatePromoCode(promoCode, newUsageLimit, newDiscountPercentage, true)

		await contract.disablePromoCode(promoCode)

		const [isValid] = await contract.validatePromoCode(promoCode)
		expect(isValid).to.be.false

		const activePromoCodes = await contract.getActivePromoCodes()
		expect(activePromoCodes).to.not.include(promoCode)
	})

	it("Should not validate invalid promo code", async function () {
		const invalidPromoCode = "INVALID"
		const [isValid] = await contract.validatePromoCode(invalidPromoCode)
		expect(isValid).to.be.false
	})

	it("Should not create promo code with zero usage limit", async function () {
		const promoCode = "PROMO"
		const zeroUsageLimit = 0
		await expect(
			contract.createPromoCode(promoCode, zeroUsageLimit, discountPercentage)
		).to.be.revertedWithCustomError(contract, "UsageLimitMustBeGreaterThanZero")
	})

	it("Should not create promo code with zero discount percentage", async function () {
		const promoCode = "PROMO"
		await expect(contract.createPromoCode(promoCode, usageLimit, 0)).to.be.revertedWithCustomError(
			contract,
			"InvalidDiscountPercentage"
		)
	})

	it("Should not update non-existing promo code", async function () {
		const nonExistingPromoCode = "NON_EXISTING"

		await expect(
			contract.updatePromoCode(nonExistingPromoCode, usageLimit, discountPercentage, true)
		).to.be.revertedWithCustomError(contract, "PromoCodeDoesNotExist")
	})

	it("Should not disable non-existing promo code", async function () {
		const nonExistingPromoCode = "NON_EXISTING"

		await expect(contract.disablePromoCode(nonExistingPromoCode)).to.be.revertedWithCustomError(
			contract,
			"PromoCodeDoesNotExist"
		)
	})

	it("Should not create presale with zero price", async function () {
		await expect(
			contract.connect(owner).createPresale(0, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)
		).to.be.revertedWithCustomError(contract, "ZeroPrice")
	})

	it("Should not create presale with zero tokens to sell", async function () {
		await expect(
			contract.connect(owner).createPresale(_price, _nextPrice, 0, _usdHardcap, _extraBonusTokens)
		).to.be.revertedWithCustomError(contract, "ZeroTokensToSell")
	})

	it("Should not set presale stage if not owner", async function () {
		await expect(contract.connect(user).setPresaleStage(1)).to.be.reverted
	})

	it("Calculates should_bonus_tokens correctly", async function () {
		await contract.connect(owner).createPresale(_price, _nextPrice, _tokenToSell, _usdHardcap, _extraBonusTokens)

		const promoCode = "PROMO"
		await contract.createPromoCode(promoCode, usageLimit, discountPercentage)

		const presaleData = await contract.presale(1)
		const promoCodeData = await contract.promoCodes(promoCode)

		const presaleExtraBonusTokens = presaleData.extraBonusTokens
		const soldBonusTokens = presaleData.soldBonusTokens
		const _discountPercentage = promoCodeData.discountPercentage
		const shouldBonusTokens = Math.min(
			Number(presaleExtraBonusTokens) - Number(soldBonusTokens),
			Number(ethers.parseEther(`${100}`)) * (Number(ethers.formatEther(_discountPercentage)) / 100)
		)
		expect(shouldBonusTokens).to.equal(
			(Number(ethers.formatEther(_discountPercentage)) / 100) * Number(ethers.parseEther(`${100}`))
		)
	})
})
