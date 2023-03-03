import { ethers } from "ethers"
import { expect } from "chai"

describe("ENS Resolver address", function () {
  it("Should resolve mainnet ens ", async function () {
    const ENSResolver = await ethers.getContractFactory("MyResolver")
    const mainnet_ens = await ENSResolver.deploy()
    
    await mainnet_ens.deployed()
    console.log('ENS resolver deployed at:'+ mainnet_ens.address)
    expect((await mainnet_ens.resolve()).toString()).to.equal('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  })
})
