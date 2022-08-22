import { v4 as uuidv4 } from 'uuid';
import CONFIG, { 
  ETH_MAINNET, 
  POLYGON_MAINNET, 
  PROD, STAGING,
  DEV,
  ConfigType
} from './config';
import { ISendNotificationInputOptions, INotificationPayload } from './types';
import {
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
  CHAIN_ID_TO_SOURCE,
  SOURCE_TYPES
} from './constants';

export function getUUID() {
  return uuidv4();
}

export const getEpnsConfig = (chainId: number, isDev?: boolean) : ConfigType => {
  // for Mainnet
  if ([ETH_MAINNET, POLYGON_MAINNET].includes(chainId)) {
    return CONFIG[chainId][PROD];
  }

  // if explicitly passed "dev: true"
  if (isDev) {
    return CONFIG[chainId][DEV];
  }

  // by default
  return CONFIG[chainId][STAGING];
};


/**
 * This function will map the Input options passed to the SDK to the "payload" structure
 * needed by the API input
 */
export function getPayloadForAPIInput(
  inputOptions: ISendNotificationInputOptions,
  recipients: any
) : INotificationPayload{
  return {
    notification: {
      title: inputOptions?.notification?.title,
      body: inputOptions?.notification?.body
    },
    data: {
      acta: inputOptions?.payload?.cta || '',
      aimg: inputOptions?.payload?.img || '',
      amsg: inputOptions?.payload?.body || '',
      asub: inputOptions?.payload?.title || '',
      type: inputOptions?.type?.toString() || '',
      ...(inputOptions?.expiry && { etime: inputOptions?.expiry }),
      ...(inputOptions?.hidden && { hidden: inputOptions?.hidden }),
      ...(inputOptions?.payload?.sectype && { sectype: inputOptions?.payload?.sectype })
    },
    // recipients: recipients
  };
}

/**
 * This function returns the recipient format accepted by the API for different notification types
 */
export async function getRecipients(
  chainId: number,
  notificationType: number,
  recipients?: string | [string],
  secretType?: string,
  channel?: string
) {
  let addressInCAIP = '';

  if (secretType) {
    let secret = '';
    // return '';
    /**
     * Currently SECRET FLOW is yet to be finalized on the backend, so will revisit this later.
     * But in secret flow we basically generate secret for the address
     * and send it in { 0xtarget: secret_generated_for_0xtarget } format for all
     */
     if (notificationType === NOTIFICATION_TYPE.TARGETTED) {
      if (typeof recipients === 'string') {
        addressInCAIP = getCAIPFormat(chainId, recipients);
        secret = ''; // do secret stuff // TODO

        return {
          [addressInCAIP]: secret
        };
      }
    } else if (notificationType === NOTIFICATION_TYPE.SUBSET) {
      if (Array.isArray(recipients)) {
        const recipientObject =  recipients.reduce((_recipients, _rAddress) => {
          addressInCAIP = getCAIPFormat(chainId, _rAddress);
          secret = ''; // do secret stuff // TODO

          return {
            ..._recipients,
            [addressInCAIP]: secret
          };
        }, {});

        return recipientObject;
      }
    }


  } else {
  /**
   * NON-SECRET FLOW
   */
    if (notificationType === NOTIFICATION_TYPE.BROADCAST) {
      if (!recipients) {
        return getCAIPFormat(chainId, channel || '');
      }
      return recipients;
    } else if (notificationType === NOTIFICATION_TYPE.TARGETTED) {
      if (typeof recipients === 'string') {
        addressInCAIP = getCAIPFormat(chainId, recipients);
        return addressInCAIP;
      }
    } else if (notificationType === NOTIFICATION_TYPE.SUBSET) {
      if (Array.isArray(recipients)) {
        const recipientObject =  recipients.reduce((_recipients, _rAddress) => {
          addressInCAIP = getCAIPFormat(chainId, _rAddress);
         return {
          ..._recipients,
          [addressInCAIP]: null
         };
        }, {});

        return recipientObject;
      }
    }
  }
  return recipients;
}

export async function getVerificationProof({
  signer,
  chainId,
  notificationType,
  identityType,
  verifyingContract,
  payload,
  ipfsHash,
  graph = {},
  uuid
}: {
  signer: any,
  chainId: number,
  notificationType: number,
  identityType: number,
  verifyingContract: string,
  payload: any,
  ipfsHash?: string,
  graph?: any,
  uuid: string
}) {

  console.log('payload ---> \n\n', payload);
  
  const type = {
    Data: [{ name: 'data', type: 'string' }]
  };
  const domain = {
    name: 'EPNS COMM V1',
    chainId: chainId,
    verifyingContract: verifyingContract,
  };
  let message = null;
  let signature = null;

  if (identityType === IDENTITY_TYPE.MINIMAL) {
    message = {
      data: `${identityType}+${notificationType}+${payload.notification.title}+${payload.notification.body}`,
    };
    signature = await signer._signTypedData(domain, type, message);
    return `eip712v2:${signature}::uid::${uuid}`;
  } else if (identityType === IDENTITY_TYPE.IPFS) {
    message = {
      data: `1+${ipfsHash}`,
    };
    signature = await signer._signTypedData(domain, type, message);
    return `eip712v2:${signature}::uid::${uuid}`;
  } else if (identityType === IDENTITY_TYPE.DIRECT_PAYLOAD) {
    const payloadJSON = JSON.stringify(payload);
    message = {
      data: `2+${payloadJSON}`,
    };
    signature = await signer._signTypedData(domain, type, message);
    return `eip712v2:${signature}::uid::${uuid}`;
  } else if (identityType === IDENTITY_TYPE.SUBGRAPH) {
    return `graph:${graph?.id}+${graph?.counter}::uid::${uuid}`;
  }
}

export function getPayloadIdentity({
  identityType,
  payload,
  notificationType,
  ipfsHash,
  graph = {},
} : {
  identityType: number,
  payload: INotificationPayload,
  notificationType?: number,
  ipfsHash?: string,
  graph?: any,
}) {
  if (identityType === IDENTITY_TYPE.MINIMAL) {
    return `0+${notificationType}+${payload.notification.title}+${payload.notification.body}`;
  } else if (identityType === IDENTITY_TYPE.IPFS) {
    return `1+${ipfsHash}`;
  } else if (identityType === IDENTITY_TYPE.DIRECT_PAYLOAD) {
    const payloadJSON = JSON.stringify(payload);
    return `2+${payloadJSON}`;
  } else if (identityType === IDENTITY_TYPE.SUBGRAPH) {
    return `3+graph:${graph?.id}+${graph?.counter}`;
  }
}

export function getSource(chainId: number, identityType: number) {
  if (identityType === IDENTITY_TYPE.SUBGRAPH) {
    return SOURCE_TYPES.THE_GRAPH;
  }
  return CHAIN_ID_TO_SOURCE[chainId];
}

export function getCAIPFormat(chainId: number, address: string) {
  // EVM based chains
  if ([1, 42, 37, 80001].includes(chainId)) {
    return `eip155:${chainId}:${address}`;
  }

  return address;
  // TODO: add support for other non-EVM based chains
}