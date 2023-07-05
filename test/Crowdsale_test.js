const { expect } = require('chai');
const { ethers } = require('hardhat')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Crowdsale', () => {
    let crowdsaleInstance

    beforeEach(async () => {
        const CrowdsaleContract = await ethers.getContractFactory('Crowdsale')
        crowdsaleInstance = await CrowdsaleContract.deploy()
    })

    describe('deployment', () => {
        it('has correct name', async () => {

            expect(await crowdsaleInstance.name()).to.eq("Crowdsale")
        })
    })

})