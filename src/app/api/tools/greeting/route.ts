import { NextResponse } from 'next/server';
import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';

interface GreetingResponse {
  message: string;
}

const config = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.mainnet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
};

async function getGreeting(): Promise<GreetingResponse> {
  const near = await connect({
    ...config,
    keyStore: new keyStores.InMemoryKeyStore(),
    headers: {}
  });

  const account = await near.account('dummy.near');
  const contract = new Contract(account, 'hello.sleet.near', {
    viewMethods: ['get_greeting'],
    changeMethods: ['set_greeting']
  });

  return (contract as any).get_greeting();
}

export async function GET() {
  try {
    const greeting = await getGreeting();
    return NextResponse.json(greeting);
  } catch (error) {
    console.error('Error getting greeting:', error);
    return NextResponse.json({ error: 'Failed to get greeting' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // For setting greeting, we'll return a transaction payload that needs to be signed
    const transactionPayload = {
      receiverId: 'hello.sleet.near',
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'set_greeting',
            args: { message },
            gas: '30000000000000',
            deposit: '0'
          }
        }
      ]
    };

    return NextResponse.json({ transactionPayload });
  } catch (error) {
    console.error('Error creating set_greeting transaction:', error);
    return NextResponse.json({ error: 'Failed to create set_greeting transaction' }, { status: 500 });
  }
}