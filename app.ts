import { PublicKey } from "@solana/web3.js";
import { toBigNumber, CreateCandyMachineInput, DefaultCandyGuardSettings, toDateTime, sol } from "@metaplex-foundation/js";
import { METAPLEX, WALLET } from "./utils/wallet";
import { NFT_METADATA } from "./utils/const";
import { NAME_COL, SYMBOL } from "./utils/data";

let COLLECTION_NFT_MINT = '';
let CANDY_MACHINE_ID = '';

async function createCollectionNft() {
    const { nft: collectionNft } = await METAPLEX.nfts().create({
        name: NAME_COL,
        uri: NFT_METADATA,
        sellerFeeBasisPoints: 1000,
        isCollection: true,
        updateAuthority: WALLET,
    });

    COLLECTION_NFT_MINT = collectionNft.address.toString();
    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);
}

async function createCandy() {
    async function generateCandyMachine() {
        const candyMachineSettings: CreateCandyMachineInput<DefaultCandyGuardSettings> =
        {
            itemsAvailable: toBigNumber(3), // Collection Size: 3
            sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
            symbol: SYMBOL,
            maxEditionSupply: toBigNumber(0), // 0 reproductions of each NFT allowed
            isMutable: true,
            creators: [
                { address: WALLET.publicKey, share: 100 },
            ],
            collection: {
                address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
                updateAuthority: WALLET,
            },
        };
        const { candyMachine } = await METAPLEX.candyMachines().create(candyMachineSettings);
        CANDY_MACHINE_ID = candyMachine.address.toString();
        console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
        console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);
    }

    async function updateCandyMachine() {
        const candyMachine = await METAPLEX
            .candyMachines()
            .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) });

        const { response } = await METAPLEX.candyMachines().update({
            candyMachine,
            guards: {
                startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
                mintLimit: {
                    id: 1,
                    limit: 3,
                },
                solPayment: {
                    amount: sol(0.1),
                    destination: METAPLEX.identity().publicKey,
                },
            }
        })

        console.log(`✅ - Updated Candy Machine: ${CANDY_MACHINE_ID}`);
        console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
    }

    await generateCandyMachine();
    await updateCandyMachine();
}

async function addItems() {
    const candyMachine = await METAPLEX
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) });
    const items = [];
    for (let i = 0; i < 3; i++) { // Add 3 NFTs (the size of our collection)
        items.push({
            name: `${SYMBOL} # ${i + 1}`,
            uri: NFT_METADATA
        })
    }
    const { response } = await METAPLEX.candyMachines().insertItems({
        candyMachine,
        items: items,
    }, { commitment: 'finalized' });

    console.log(`✅ - Items added to Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}


async function mintNft() {
    const candyMachine = await METAPLEX
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) });
    let { nft, response } = await METAPLEX.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: WALLET.publicKey,
    }, { commitment: 'finalized' })

    console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

async function mint() {
    for (let i = 0; i < 3; i++) {
        await mintNft();
    }
}

async function main() {
    await createCollectionNft();
    await createCandy();
    await addItems();
    await mint();
}

main();