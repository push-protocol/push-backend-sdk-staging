## INPUT from the CONSUMER to the SDK

signer
chainId
type (notification type - BROADCAST, TARGETTED, SUBSET)
storage (
    storage type - 
        0_SMART_CONTRACT
        1_IPFS,
        2_DIRECT_PAYLOAD,
        3_SUBGRAPH
)
notification { title, body }
payload { title, body, cta, img }
recipients
channel


## INPUT from the SDK to the API

REQ BODY:

NEW verificationProof: 
        SMART_CONTRACT => eip155:chainId:txHash
        IPFS => eip712:signature
        DIRECT_PAYLOAD => eip712:signature
        SUBGRAPH => thegraph:<some_other_stuff>

verificationProof: verificationType + signature 
    (
        verificationType => 
            SMART_CONTRACT => eip155:chainId:txHash
            IPFS => eip712:signature
            DIRECT_PAYLOAD => eip712:signature
            SUBGRAPH => thegraph:signature
        
        signature =>
            EIP712 =>  
                DOMAIN =>
                    name => 'EPNS COMM V1',
                    chainId => ON WHICHEVER CHAINID the sendNotification is called,
                    verifyingContract => EPNS contract address
                TYPE =>
                    ?? need confirmation here ??
                payload => 
                    the below "payload" key which is sent.

            (* any other type of signatures??)
    )
identity: storage + "payload" Hash -->
    https://github.com/ethereum-push-notification-service/epns-push-service-dev/blob/main/src/devtools/payloads/devtools.verificationEIP712V2.mjs
channel
source:  
    one of these ['ETH_MAINNET', 'ETH_TEST_KOVAN', 'POLYGON_MAINNET', 'POLYGON_TEST_MUMBAI'] based on sdkInput.chainId
    what if there is no chainID ??
<!-- payload {
    notification: {
        title: sdkInput.notification?.title,
        body: sdkInput.notification?.body
    },
    data: {
        acta: sdkInput.payload.cta,
        aimg: sdkInput.payload.img,
        amsg: sdkInput.payload.body,
        asub: sdkInput.payload.title,
        type: sdkInput.type,
        etime: sdkInput.expiry,
        hidden: sdkInput.hidden,
        sectype: sdkInput.payload.sectype,
    }
    recipients: stringify({ addr: value }) /* ?? confirm this */
} -->