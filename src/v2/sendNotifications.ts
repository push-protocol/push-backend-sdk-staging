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
      dev,
      // newly added PROPS: TODO: check about these
      graph,
      ipfsHash,
      txHash,      
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
      graph,
      ipfsHash,
      txHash
    });

    const identity = getPayloadIdentity({
      storage,
      payload: notificationPayload,
      notificationType: type,
      graph
    });

    const source = getSource(chainId, storage);
   
    const apiPayload = {
      verificationProof,
      identity,
      channel: getCAIPFormat(chainId, _channel),
      source,
      recipient: _recipients
    };

    const requestURL = `${epnsConfig.API_BASE_URL}/v1/payloads/`;

    console.log(
      '\n\nAPI call :-->> ',
      requestURL,
      '\n\n',
      apiPayload,
      '\n\n\n\n'
    );

    return await axios.post(
      requestURL,
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