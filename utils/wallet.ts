import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';
import secret from '../guideSecret.json';
import { Connection, Keypair } from "@solana/web3.js";
import bs58 from 'bs58';

export const QUICKNODE_RPC = "https://billowing-dimensional-orb.solana-devnet.quiknode.pro/a29ffd3b7a4edd906cc89a1869a19a166d047f03/"; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint

export const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC, { commitment: 'finalized' });

export const PRIVATE_KEY = bs58.encode(secret);

export const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));

export const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
    .use(keypairIdentity(WALLET));