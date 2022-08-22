# Input for the SDK sendNotification()

## When using in SERVER code

```bash
npm i @epnsproject/backend-sdk-staging
```

```typescript
const ethers = require('ethers');
// local lib
const { sendNotification } = require('./lib'); 
// or direct npm package like
// const { sendNotification } = require('@epnsproject/backend-sdk-staging');

const PK = 'd5797b255933f72a6a084fcfc0f5f4881defee8c1ae387197805647d0b10a8a0'; // PKey
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);
const testChannelAddress = '0xD8634C39BBFd4033c0d3289C4515275102423681';

const NOTIFICATION_TYPE = {
    BROADCAST: 1,
    TARGETTED: 3,
    SUBSET: 4
};

const IDENTITY_TYPE = {
    MINIMAL: 0,
    IPFS: 1,
    DIRECT_PAYLOAD: 2,
    SUBGRAPH: 3
  };

const timestamp = Date.now();

const OPTIONS_MATRIX = {
  TARGETTED: {
    DIRECT_PAYLOAD:  {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.TARGETTED,
        identityType: IDENTITY_TYPE.DIRECT_PAYLOAD,
        notification: {
            title: `[SDK-TEST] notification TITLE: ${timestamp}`,
            body: `[sdk-test] notification BODY ${timestamp}`
        },
        payload: {
            title: `[sdk-test] payload title ${timestamp}`,
            body: `type:${NOTIFICATION_TYPE.TARGETTED} identity:${IDENTITY_TYPE.DIRECT_PAYLOAD}`,
            cta: '',
            img: ''
        },
        recipients: '0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1',
        channel: testChannelAddress,
        dev: true
    },
    IPFS: {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.TARGETTED,
        identityType: IDENTITY_TYPE.IPFS,
        ipfsHash: 'bafkreicuttr5gpbyzyn6cyapxctlr7dk2g6fnydqxy6lps424mcjcn73we', // from BE devtools
        notification: {
            title: `[SDK-TEST] notification TITLE: ${timestamp}`,
            body: `[sdk-test] notification BODY ${timestamp}`
        },
        payload: {
            title: `[sdk-test] payload title ${timestamp}`,
            body: `type:${NOTIFICATION_TYPE.TARGETTED} identity:${IDENTITY_TYPE.IPFS}`,
            cta: '',
            img: ''
        },
        recipients: '0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1',
        channel: testChannelAddress,
        dev: true
    },
    MINIMAL: {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.TARGETTED,
        identityType: IDENTITY_TYPE.MINIMAL,
        notification: {
            title: `[SDK-TEST] notification TITLE: ${timestamp}`,
            body: `[sdk-test] notification BODY ${timestamp}`
        },
        payload: {
            title: `[sdk-test] payload title ${timestamp}`,
            body: `type:${NOTIFICATION_TYPE.TARGETTED} identity:${IDENTITY_TYPE.MINIMAL}`,
            cta: '',
            img: ''
        },
        recipients: '0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1',
        channel: testChannelAddress,
        dev: true
    },
    GRAPH: {
        signer,
        chainId: 42,
        type: NOTIFICATION_TYPE.TARGETTED,
        identityType: IDENTITY_TYPE.SUBGRAPH,
        graph: {
          id: 'graph:aiswaryawalter/graph-poc-sample',
          counter: 3
        },
        notification: {
            title: `[SDK-TEST] notification TITLE: ${timestamp}`,
            body: `[sdk-test] notification BODY ${timestamp}`
        },
        payload: {
            title: `[sdk-test] payload title ${timestamp}`,
            body: `type:${NOTIFICATION_TYPE.TARGETTED} identity:${IDENTITY_TYPE.SUBGRAPH}`,
            cta: '',
            img: ''
        },
        recipients: '0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1',
        channel: testChannelAddress,
        dev: true
    }
  }
};

async function trigger(input, name) {
    console.log(`........${name}...starts............>>\n`);
    try {
        const apiResponse = await sendNotification(input);
        console.log('apiResponse: ', apiResponse);
    } finally {
        console.log(`<<........${name}....ends...........\n`);
    }
}

async function main() {
    try {
        console.log(`\n\nTEST code calling sendNotification() at ${timestamp}\n`);
        await trigger(OPTIONS_MATRIX.TARGETTED.DIRECT_PAYLOAD, 'OPTIONS_MATRIX.DIRECT_PAYLOAD');
        // await trigger(OPTIONS_MATRIX.TARGETTED.IPFS, 'OPTIONS_MATRIX.TARGETTED.IPFS');
        // await trigger(OPTIONS_MATRIX.TARGETTED.MINIMAL, 'OPTIONS_MATRIX.TARGETTED.MINIMAL');
        // await trigger(OPTIONS_MATRIX.TARGETTED.GRAPH, 'OPTIONS_MATRIX.TARGETTED.GRAPH');
    } catch (e) {
        console.log('\n\nTest Error: ', e.message);
    }
}

main();
```