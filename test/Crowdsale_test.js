const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

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
        crowdsaleInstance = await CrowdsaleContract.deploy(tokenInstance.address, ether(1))

        // Send tokens to Crowdsale
        let transaction = await tokenInstance.connect(deployer).transfer(crowdsaleInstance.address, tokens(1000000))
        await transaction.wait()
    })

    describe('Deployment', () => {

        it('sends tokens to the Crowdsale contract', async () => {
            expect(await tokenInstance.balanceOf(crowdsaleInstance.address)).to.equal(tokens(1000000))
        })

        it('returns the price', async () => {
            expect(await crowdsaleInstance.price()).to.equal(ether(1))
        })

        it('returns token address', async () => {
            expect(await crowdsaleInstance.token()).to.equal(tokenInstance.address)
        })
    })

    describe('Buying Tokens', () => {
        let transaction, result
        let amount = tokens(10)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsaleInstance.connect(user1).buyTokens(amount, { value: ether(10) })
                result = await transaction.wait()
            })
            it('transfers tokens', async () => {

                expect(await tokenInstance.balanceOf(crowdsaleInstance.address)).to.equal(tokens(999990))
                expect(await tokenInstance.balanceOf(user1.address)).to.equal(amount)
            })

            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsaleInstance.address)).to.equal(amount)
            })
            it('emits a buy event', async () => {
                await expect(transaction).to.emit(crowdsaleInstance, 'Buy').withArgs(amount, user1.address)
            })
        })

        describe('Failure', () => {
            it('rejects insufficent ETH', async () => {
                await expect(crowdsaleInstance.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
            })
        })
    })
})