import axios from 'axios';
import { ISendNotificationInputOptions } from './types';
import {
  getEpnsConfig,
  getPayloadForAPIInput,
  getPayloadIdentity,
  getRecipients,
  getVerificationProof,
  getSource,
  getCAIPFormat
} from './helpers';


export async function sendNotification(options: ISendNotificationInputOptions) {
  try {
    const {
      signer,
      chainId,
      type,
      storage,
      payload,
      recipients,
      channel,
      graph,
      dev
    } = options || {};

    const _channel = channel || signer.address;

    const epnsConfig = getEpnsConfig(chainId, dev);
    const _recipients = await getRecipients(chainId, type, recipients, payload?.sectype, _channel);
    const notificationPayload = getPayloadForAPIInput(options, _recipients);

    const verificationProof = await getVerificationProof({
      signer,
      chainId,
      storage,
      verifyingContract: epnsConfig.EPNS_COMMUNICATOR_CONTRACT,
      payload: notificationPayload,
      subgraphId: graph?.id,
      subgraphNotificationCounter: graph?.counter
    });

    const identity = getPayloadIdentity({
      storage,
      payload: notificationPayload,
      notificationType: type,
      subgraphId: graph?.id,
      subgraphNotificationCounter: graph?.counter
    });

    const source = getSource(chainId, storage);
   
    const apiPayload = {
      verificationProof,
      identity,
      channel: getCAIPFormat(chainId, _channel),
      source,
      // recipient: _recipients
    };

    console.log(
      '\n\nAPI call :-->> ',
      epnsConfig.API_BASE_URL,
      '\n\n',
      apiPayload,
      '\n\n\n\n'
    );

    return await axios.post(
      epnsConfig.API_BASE_URL + '/payloads/add',
      apiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (err) {
    console.error('[EPNS-SDK] - Error - sendNotification() - ', err);
    throw err;
  }
}