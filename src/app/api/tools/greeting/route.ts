import { NextResponse } from 'next/server';
import { connect, Contract, keyStores } from 'near-api-js';
import { signRequestFor } from '@bitte-ai/agent-sdk';

interface GreetingResponse {
  message: string;
}

interface GreetingContract extends Contract {
  get_greeting(): Promise<GreetingResponse>;
  set_greeting(args: { message: string }): Promise<void>;
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
    changeMethods: ['set_greeting'],
    useLocalViewExecution: true
  }) as GreetingContract;

  return contract.get_greeting();
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

    const transactionPayload = {
      receiverId: 'hello.sleet.near',
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'set_greeting',
            args: JSON.stringify({ message }),
            gas: '30000000000000',
            deposit: '0'
          }
        }
      ]
    };

    const signRequest = signRequestFor({
      chainId: 'near',
      transactions: [transactionPayload]
    });

    return NextResponse.json({ signRequest });
  } catch (error) {
    console.error('Error creating set_greeting transaction:', error);
    return NextResponse.json({ error: 'Failed to create set_greeting transaction' }, { status: 500 });
  }
}