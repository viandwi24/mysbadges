import fs from 'fs'
import path from 'path'
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  SystemProgram,
  sendAndConfirmTransaction,
  Transaction,
 } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token'

export const log = (message?: any, ...optionalParams: any[]) => {
  console.log(message || '', ...optionalParams)
}

export const getKeypair = (path: string) => {
  const file = fs.readFileSync(path, 'utf-8')
  return Keypair.fromSecretKey(Buffer.from(JSON.parse(file)))
}

export class MySolBadgesMinter {
  programKeypair: Keypair
  programID: PublicKey

  constructor(public connection: Connection) {
    this.programKeypair = getKeypair(path.join(__dirname, './dist/program/mint-keypair.json'))
    this.programID = this.programKeypair.publicKey

    log(`===> Create Minter`)
    log(`URL : ${connection.rpcEndpoint}`)
    log(`Program : ${this.programID}`)
    log()
  }

  async mint(kpAuth: Keypair, kpUser: Keypair) {
    // setup
    log(`===> Setup`)
    log(`Auth : ${kpAuth.publicKey}`)
    log(`User : ${kpUser.publicKey}`)
    log()

    // create mint account
    log(`===> Create Mint Account`)
    const mint = Keypair.generate()
    log(`Mint Account : ${mint.publicKey}`)
    log()

    // get token address
    log(`===> Get Token Address`)
    const tokenAddress = await getAssociatedTokenAddress(
      mint.publicKey,
      kpUser.publicKey,
    )
    log(`Token Address : ${tokenAddress}`)
    log()

    // create tx to program
    log(`===> Create Transaction Instruction`)
    const instructions = new TransactionInstruction({
      keys: [
        // Mint account
        {
          pubkey: mint.publicKey,
          isSigner: true,
          isWritable: true,
        },
        // Token account
        {
          pubkey: tokenAddress,
          isSigner: false,
          isWritable: true,
        },
        // Mint authority
        {
          pubkey: kpUser.publicKey,
          isSigner: true,
          isWritable: false,
        },
        // Rent
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        // System program
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        // Token program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // Associated token program
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.programID,
      data: Buffer.alloc(0),
    })
    log()


    // send tx
    log(`===> Send Transaction`)
    const tx = await sendAndConfirmTransaction(
      this.connection,
      new Transaction().add(instructions),
      [kpUser, mint]
    )
    log()
  }
}
