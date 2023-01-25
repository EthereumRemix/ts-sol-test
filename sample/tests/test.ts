// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { ethers } from "ethers";
import { expect } from "chai";

let remix: ethers.Contract
let proxy: ethers.Contract
let verifier: ethers.Contract
describe("Basic remix reward deploy", function () {
  it("Deploy with proxy", async function () {
    const [owner, betatester, user] = await ethers.getSigners();
    const Remix = await ethers.getContractFactory("Remix");
    remix = await Remix.connect(owner).deploy();
    await remix.deployed()

    const implAddress = remix.address
    console.log('implementation address', implAddress)

    const Proxy = await ethers.getContractFactory('ERC1967Proxy')
    proxy = await Proxy.connect(owner).deploy(implAddress, '0x8129fc1c')
    await proxy.deployed()
    console.log("Remix reward deployed to:", proxy.address);

    remix = await ethers.getContractAt("Remix", proxy.address)
    remix = remix.connect(owner)

    expect(await remix.name()).to.equal('Remix');
  });

  it("Should mint a badge", async function () {
    const [owner, betatester, user] = await ethers.getSigners();
    const ipfsHash = '0xabcd1234'
    const txAddType = await remix.addType('Beta Tester')
    await txAddType.wait()
    const mint = await remix.safeMint(betatester.address, 'Beta Tester', '0.22.0', ipfsHash, 2)
    await mint.wait()
    expect((await remix.allowedMinting(betatester.address))).to.equal(2);
    expect((await remix.allowedMinting(user.address))).to.equal(0);
  });

  it("Should re-mint a badge", async function () {
    const [owner, betatester, user] = await ethers.getSigners();
    
    const mint = await remix.connect(betatester).publicMint(user.address)
    await mint.wait()
    expect((await remix.allowedMinting(betatester.address))).to.equal(1);

    expect((await remix.allowedMinting(user.address))).to.equal(0);
    expect((await remix.balanceOf(user.address))).to.equal(1);

  });

  it("Should assign an empty hash", async function () {
    const [owner, betatester, user] = await ethers.getSigners();

    // check if hash is empty
    let data = await remix.tokensData(1)
    expect(data[2]).to.equal('0x');
    
    // assign it
    await (await remix.connect(owner).assignHash(1, '0xabcd'))
    data = await remix.tokensData(1)
    expect(data[2]).to.equal('0xabcd');

    // should not allow re-assigning an hash
    await expect(remix.connect(owner).assignHash(1, '0xabef')).to.be.revertedWith('revert hash already set')
  });

  it("Set a contributor badge hash", async function () {
    const [owner, betatester, user] = await ethers.getSigners();
    await expect(remix.connect(betatester).setContributorHash('0x000000000000000000000000000000000000000000000000000000000000000a'))
      .to.be.revertedWith('is missing role 0x0000000000000000000000000000000000000000000000000000000000000000') // remixer badge hash
    const contributor = await remix.connect(owner).setContributorHash('0x000000000000000000000000000000000000000000000000000000000000000a')
    await contributor.wait()
  });

  it("Should not be allowed minting", async function () {
    const [owner, betatester, user] = await ethers.getSigners();
    const ipfsHash = '0xabcd1234'
    await expect(remix.connect(betatester).safeMint(betatester.address, 'Beta Tester', '0.22.0', ipfsHash, 2)).to.be.revertedWith('is missing role 0x0000000000000000000000000000000000000000000000000000000000000000')
  });

  it("Should publish verifier", async function () {
    const [owner, betatester, user, betatester2] = await ethers.getSigners();
    // deploy verifier
    const Verifier = await ethers.getContractFactory("Verifier");      
    verifier = await Verifier.connect(owner).deploy();
    await verifier.deployed();    
  });

  const proof1 = [[["0x2d08ce546a37682b5a42fce21538a61efa91cc1cd100216d3969a02ed5c58ab4","0x1e77b35455fc083c278f57a634718efc40c0e8f2dfef831a4fd9b9e6cf928223"],[["0x2454015f95980b04db8e34a838baf1d772b1854cacfbb5bbd51cfcdfc73d889b","0x0dcaca7fde086b0ab360c4b8b2365529dad6303cc642b48fd427809e02c8f682"],["0x11fdf5b0498a8faabcfd5e72ad21adaa4dfcbd92037f579536790fc9618d3bc3","0x03a7808b553c7fdc561014b6859e23801d9a7a9f5e132ffc4e2fedd6229aaf58"]],["0x03ca01b679100bc0f2ba6a6ced00282417fa0dcf5b5226acf8c3b40c5cfe8be4","0x145f59f69c98ef71d89c72acaa13f5c4a4c4c1ba265b0b812cfbe3433d26ca76"]],["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x000000000000000000000000000000000000000000000000000000000000002a"]]
  const proof2 = [[["0x1bb1a812546a2084260b20d8f1d96d9a163e1ce3fe237024fb6e208c03e4973b","0x1265cf8ae910b64d86a7d83330f70bf33da46a22dc8be58f65346fd67c183933"],[["0x0bc877645ef93a63cf4ba85f1b4c801faf50f910978dd34909b184ea0e489aea","0x26616488402ff4e8d5544f33721e3dc361a5cdf064175b7e709d5c7ebb1b5cc3"],["0x2ac474948439a696b7cd9eef97dfc39982f9beb5b9a8eda03483229e5a196100","0x06e7a8e54fb02b9a9245c7342788bd4ee9ba5cd5b028f5bbc235d20ee5d4d7aa"]],["0x08529770f13a087234e5ff13427d46277830a6215e41797112e6521041769664","0x0bd2862a1ecec4f62d7b5c68cae524f8bfff1cdbe98d1e0e1d43795740e92b78"]],["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x0000000000000000000000000000000000000000000000000000000000000372"]]
  const proof3 = [[["0x184bf659e78249d8f6b875740354a8229474eef4e039fa005e0c94cf6d18730f","0x1dd379512de86bee64452ecb344776b5ef5e79773a9dec01e32729181bd17b96"],[["0x05bfbff5b2d026c9d64cbff625f11e54136158b84ade02801af157d09c6b1825","0x0acecff510657e4a4dee8fd125d56eb0aa45ba2be7d80eee97eb2269c4dc8451"],["0x179f3c91af951fedf7b216d92f695fad45470a104ae525c3d8d576e072d562bb","0x2f3ba787cac75c2c3489d8940712c8b4c033311a985149c9b4d965da02e9e2ef"]],["0x11e80b75b4f61f0f0cfc9e325bf5219827996048cdfbd8e051359bf3e766c48d","0x04aa461b439182429664d76dbab3f50c73e37fef2435feb1915bae99e8d33da3"]],["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x0000000000000000000000000000000000000000000000000000000000002276"]]
  const proof4 = [[["0x28c44fe20ea2346f270b004004ca41acf16002c76e77e7c6b3fa37bb98766fb4","0x2504d286b705ff28fd86e70c1da1479cfa6f3c17ad1dc1ea57f6bc455df74097"],[["0x063bec5006614c76259388347ba0b4e5e0f3e67b36bdfc0a10fdf5b7b88242e3","0x24254541318be4ae435cb44b278c6d3a7a533968054d7107812facae8799e5ae"],["0x060259403134eaa2354b48e878679d6b2e1df3ba7d213ef62ee63bb7db10bf56","0x05f98dd3ee68a17b5cb418f4b4681658e73c1c5ed0f819fea12df85f10a975c0"]],["0x1c18b42785fbd83d87050f6352f8543e6aee6f907a6e1be2b218764923f3ab96","0x23507955e5596e8f9f6c29d82b5764ac3094ab2414abe4360d075c4e063580cc"]],["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x00000000000000000000000000000000000000000000000000000000000d7670"]]
  const challengeHashes = ['281969979063453985172741380982846584566', '88422393177988462612949727007266787516']

  it("Should set a new challenge", async function () {
    const [owner, betatester, user, betatester2] = await ethers.getSigners();
    
    console.log("verifier address", verifier.address)
    const setChallengeTx = await remix.connect(owner).setChallenge(verifier.address, challengeHashes, 3);
    await setChallengeTx.wait()
  })

  it("Should refuse an invalid challenge", async function () {   
    const [owner, betatester, user, betatester2] = await ethers.getSigners();

    const invalidInput = ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x000000000000000000000000000000000000000000000000000000000000002b"]
    await expect(remix.connect(betatester2).publishChallenge(proof1[0], invalidInput)).to.be.revertedWith("the provided proof isn't valid")
  });

  it("Should accept a challenge", async function () {   
    const [owner, betatester, user, betatester2] = await ethers.getSigners();

    const publishChallengeTx = await remix.connect(betatester2).publishChallenge(proof1[0], proof1[1])
    await publishChallengeTx.wait()
  });

  it("Should refuse a challenge if proof has already been published", async function () {    
    const [owner, betatester, user, betatester2] = await ethers.getSigners();
    
    await expect(remix.connect(owner).publishChallenge(proof1[0], proof1[1])).to.be.revertedWith('proof already published')
  });

  it("Should refuse a challenge if sender already published a valid solution", async function () {    
    const [owner, betatester, user, betatester2] = await ethers.getSigners();
    
    await expect(remix.connect(betatester2).publishChallenge(proof2[0], proof2[1])).to.be.revertedWith('current published has already submitted')
  });

  it("Published should reach maximum count", async function () {    
    const [owner, betatester, user, betatester2, user2, user3] = await ethers.getSigners();
    
    const pub2 = await remix.connect(owner).publishChallenge(proof2[0], proof2[1])
    await pub2.wait()

    const pub3 = await remix.connect(user2).publishChallenge(proof3[0], proof3[1])
    await pub3.wait()

    expect(await remix.publishersAmount()).to.be.equal(3)
    expect(remix.connect(user3).publishChallenge(proof4[0], proof4[1])).to.revertedWith('publishers reached maximum amount')
  });

  it("Should re-set a new challenge", async function () {
    const [owner, betatester, user, betatester2] = await ethers.getSigners();
    
    console.log("verifier address", verifier.address)
    const setChallengeTx = await remix.connect(owner).setChallenge(verifier.address, challengeHashes, 3);
    await setChallengeTx.wait()
  })

  it("Should refuse again an invalid challenge", async function () {   
    const [owner, betatester, user, betatester2] = await ethers.getSigners();

    const invalidInput = ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6","0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc","0x000000000000000000000000000000000000000000000000000000000000002b"]
    await expect(remix.connect(betatester2).publishChallenge(proof1[0], invalidInput)).to.be.revertedWith("the provided proof isn't valid")
  });

  it("Should accept again a challenge", async function () {   
    const [owner, betatester, user, betatester2] = await ethers.getSigners();

    const publishChallengeTx = await remix.connect(betatester2).publishChallenge(proof1[0], proof1[1])
    await publishChallengeTx.wait()
  });
});

