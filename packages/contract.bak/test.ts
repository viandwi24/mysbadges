import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import {} from '@metaplex-foundation/js'
import { MySolBadgesMinter, getKeypair } from './utils'
import path from 'path'

// run
// setup::account
const kpAuth = getKeypair(path.join(__dirname, './configs/keypairs/u1.json'))
const kpUser = getKeypair(path.join(__dirname, './configs/keypairs/u2.json'))
// setup::minter
const url = clusterApiUrl('devnet')
const connection = new Connection(url)
const minter = new MySolBadgesMinter(connection)
// run::mint
minter.mint(kpAuth, kpUser)
