import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const [deployer] = await ethers.getSigners()

	const contractBalance = await ethers.provider.getBalance(deployer)

	console.log("Deployer Balance:", ethers.formatEther(contractBalance), "ETH")

	console.log("Deployer", deployer.address)
	const ethUsdAggregatorAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
	const usdtAddress = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0"

	await hre.deployments.deploy("BrandPresale", {
		from: deployer.address,
		args: [ethUsdAggregatorAddress, usdtAddress, 0],
		log: true,
	})
}
export default func
func.tags = ["presale"]
