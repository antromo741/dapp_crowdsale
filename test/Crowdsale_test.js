const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Crowdsale', () => {
    let crowdsaleInstance, tokenInstance

    beforeEach(async () => {
        const CrowdsaleContract = await ethers.getContractFactory('Crowdsale')

        const TokenContract = await ethers.getContractFactory('Token')

        tokenInstance = await TokenContract.deploy('Dapp University', 'DAPP', '1000000')

        crowdsaleInstance = await CrowdsaleContract.deploy(tokenInstance.address)
    })

    describe('deployment', () => {

        it('returns token address', async () => {
            expect(await crowdsaleInstance.token()).to.equal(tokenInstance.address)
        })
    })

})