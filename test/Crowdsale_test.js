const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Crowdsale', () => {
    let crowdsaleInstance, tokenInstance
    let accounts, deployer, user1

    beforeEach(async () => {
        //Load Contracts
        const CrowdsaleContract = await ethers.getContractFactory('Crowdsale')
        const TokenContract = await ethers.getContractFactory('Token')

        //Deploy Token
        tokenInstance = await TokenContract.deploy('Dapp University', 'DAPP', '1000000')

        // Configure Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        // Deploy CrowdSale
        crowdsaleInstance = await CrowdsaleContract.deploy(tokenInstance.address)

        // Send tokens to Crowdsale
        let transaction = await tokenInstance.connect(deployer).transfer(crowdsaleInstance.address, tokens(1000000))
        await transaction.wait()
    })

    describe('deployment', () => {
        it('sends tokens to the Crowdael contract', async () => {
            expect(await tokenInstance.balanceOf(crowdsaleInstance.address)).to.equal(tokens(1000000))
        })

        it('returns token address', async () => {
            expect(await crowdsaleInstance.token()).to.equal(tokenInstance.address)
        })
    })

    describe('Buying Tokens', () => {
let amount =tokens(10)

        describe('Success', () => {
            it('transfers tokens', async () => {
                let transaction = await crowdsaleInstance.connect(user1).buyTokens(amount)
                let result = await transaction.wait()
                expect( await tokenInstance.balanceOf(crowdsaleInstance.address)).to.equal(tokens(999990))
                expect(await tokenInstance.balanceOf(user1.address)).to.equal(amount)
            })
        })
    })
})