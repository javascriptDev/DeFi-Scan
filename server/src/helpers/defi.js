const Web3Util = require('./web3')
const BlockSignerABI = require('../contracts/abi/BlockSigner')
const contractAddress = require('../contracts/contractAddress')
const DefiValidatorABI = require('../contracts/abi/DefiValidator')
const logger = require('./logger')

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

let blockSigner = {
    getBlockSignerContract: async () => {
        let web3 = await Web3Util.getWeb3()
        return new web3.eth.Contract(BlockSignerABI, contractAddress.BlockSigner)
    },
    getSigners: async (blockHash) => {
        let bs = await blockSigner.getBlockSignerContract()
        return bs.methods.getSigners(blockHash).call().catch(e => {
            logger.warn('Cannot get signer of block %s. Sleep 2 seconds and try more', blockHash)
            return sleep(2000).then(() => {
                return blockSigner.getSigners(blockHash)
            })
        })
    }
}
let defiValidator = {
    getValidatorContract: async () => {
        let web3 = await Web3Util.getWeb3()
        return new web3.eth.Contract(DefiValidatorABI, contractAddress.DefiValidator)
    },
    getValidatorContractWs: async () => {
        let web3 = await Web3Util.getWeb3Socket()
        return new web3.eth.Contract(DefiValidatorABI, contractAddress.DefiValidator)
    },
    getCandidateOwner: async (candidate) => {
        let tc = await defiValidator.getValidatorContract()
        return tc.methods.getCandidateOwner(candidate).call().catch(e => {
            logger.warn('cannot get owner of candidate %s. Sleep 2 seconds and try more', candidate)
            return sleep(2000).then(() => {
                return defiValidator.getCandidateOwner(candidate)
            })
        })
    },
    getVoterCapacity: async (candidate, voter) => {
        let tc = await defiValidator.getValidatorContract()
        return tc.methods.getVoterCap(candidate, voter).call().catch(e => {
            logger.warn('cannot get owner of candidate %s. Sleep 2 seconds and try more', candidate)
            return sleep(2000).then(() => {
                return defiValidator.getVoterCapacity(candidate, voter)
            })
        })
    }
}

module.exports = { blockSigner, defiValidator }
