import React from 'react'
import { ProgressBar } from 'react-bootstrap'


const Progress = ({ maxTokens, tokensSold }) => {
    return (
        <div>
            <ProgressBar now={((tokensSold / maxTokens) * 100)} label={`${(tokensSold / maxTokens) * 100}%`} />
            <p className='text-center my-3'>{tokensSold} / {maxTokens} Tokens Sold</p>
        </div>
    )
}

export default Progress