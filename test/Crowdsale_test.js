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
        crowdsaleInstance = await CrowdsaleContract.deploy(tokenInstance.address, ether(1), '1000000')

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

            it('updates tokenSold', async () => {
                expect(await crowdsaleInstance.tokensSold()).to.equal(amount)
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

    describe('Sending ETH', () => {
        let transaction, result
        let amount = ether(10)

        describe('Success', () => {

            beforeEach(async () => {
                //send transaction comes from the ethers.js library
                transaction = await user1.sendTransaction({ to: crowdsaleInstance.address, value: amount })
                result = await transaction.wait()
            })

            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsaleInstance.address)).to.equal(amount)
            })

            it('updates user token balance', async () => {
                expect(await tokenInstance.balanceOf(user1.address)).to.equal(amount)
            })

        })
    })

    describe('Finalizing sale', () => {
        let transaction, result
        let amount = tokens(10)
        let value = ether(10)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsaleInstance.connect(user1).buyTokens(amount, { value: value })
                result = await transaction.wait()

                transaction = await crowdsaleInstance.connect(deployer).finalize()
                result = await transaction.wait()
            })

            it('transfers remaining tokens to owner', async () => {
                expect(await tokenInstance.balanceOf(crowdsaleInstance.address)).to.equal(0)
                expect(await tokenInstance.balanceOf(deployer.address)).to.equal(tokens(999990))
            })

            it('transfers ETH balance to owner', async () => {
                expect(await ethers.provider.getBalance(crowdsaleInstance.address)).to.equal(0)
            })

            it('emits Finalize event', async () => {
                await expect(transaction).to.emit(crowdsaleInstance, "Finalize").withArgs(amount, value)
            })
        })
        
        describe('Failure', () => {
            it('prevents non-owner from finalizing', async () => {
                await expect(crowdsaleInstance.connect(user1).finalize()).to.be.reverted
            })
        })
    })
})