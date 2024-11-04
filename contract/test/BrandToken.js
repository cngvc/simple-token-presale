const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("BrandToken", function () {
	let contract
	let owner
	let user

	beforeEach(async function () {
		const signers = await ethers.getSigners()
		owner = signers[0]
		user = signers[1]

		const Contract = await ethers.getContractFactory("BrandToken")
		contract = await Contract.deploy("Brand", "BRD", 100_000_000)
	})

	it("Should have correct initial values", async function () {
		expect(await contract.name()).to.equal("Brand")
		expect(await contract.symbol()).to.equal("BRD")
		expect(await contract.totalSupply()).to.equal(100_000_000)
		expect(await contract.balanceOf(owner.address)).to.equal(100_000_000)
	})

	it("Should allow transfers between accounts", async function () {
		await contract.transfer(await user.getAddress(), 10_000_000)
		expect(await contract.balanceOf(await owner.getAddress())).to.equal(90_000_000)
		expect(await contract.balanceOf(await user.getAddress())).to.equal(10_000_000)
	})

	it("Should not allow non-owner to mint tokens", async function () {
		await expect(contract.connect(user).mint(user.address, 100_000_000))
		expect(await contract.balanceOf(user.address)).to.equal(0)
	})

	it("Should allow owner to burn tokens", async function () {
		await contract.connect(owner).burn(10_000_000)
		expect(await contract.balanceOf(await owner.getAddress())).to.equal(90_000_000)
	})

	it("Should not allow non-owner to burn tokens", async function () {
		await contract.connect(owner).mint(await owner.getAddress(), 100_000_000)
		await expect(contract.connect(user).burn(100_000_000)).to.be.reverted
	})

	it("Should correct balance after transfers between accounts", async function () {
		await contract.transfer(await user.getAddress(), 10_000_000)
		await contract.connect(owner).burn(10_000_000)
		expect(await contract.balanceOf(await owner.getAddress())).to.equal(80_000_000)
		expect(await contract.balanceOf(await user.getAddress())).to.equal(10_000_000)
	})

	it("Should not allow burning more tokens than balance", async function () {
		await expect(contract.connect(owner).burn(200_000_000)).to.be.reverted
	})

	it("Should allow owner to transfer ownership", async function () {
		await contract.transferOwnership(await user.getAddress())
		expect(await contract.owner()).to.equal(await user.getAddress())
	})
})
