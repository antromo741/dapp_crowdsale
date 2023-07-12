import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Container } from 'react-bootstrap'
import Navigation from './Navigation'
import Info from './Info'

import TOKEN_ABI from '../abis/Token.json'
import CROWDSALE_ABI from '../abis/Crowdsale.json'

import config from './config.json'

function App() {

    const [account, setAccount] = useState(null)

    const [accountBalance, setAccountBalance] = useState(null)

    const [provider, setProvider] = useState(null)

    const [crowdsale, setCrowdale] = useState(null)

    const [isLoading, setIsLoading] = useState(true)


    const loadBlockchainData = async () => {
        // set provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

        // initiate contracts

        const token = new ethers.Contract(config[31337].token.address, TOKEN_ABI, provider)

        const crowdsale = new ethers.Contract(config[31337].crowdsale.address, CROWDSALE_ABI, provider)

        setCrowdale(crowdsale)

        // fetch account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)

        const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)

        setAccountBalance(accountBalance)

        setIsLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
            loadBlockchainData()
        }

    }, [isLoading])

    return (
        <Container>
            <Navigation />
            <hr />
            {
                account && (
                    <Info account={account} accountBalance={accountBalance} />
                )}

        </Container>
    )
}

export default App