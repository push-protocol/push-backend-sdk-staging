import axios from 'axios';
import { ISendNotificationInputOptions } from './types';
import {
  getEpnsConfig,
  getPayloadForAPIInput,
  getPayloadIdentity,
  getRecipients,
  getRecipientFieldForAPIPayload,
  getVerificationProof,
  getSource,
  getCAIPFormat,
  getUUID
} from './helpers';
import { NOTIFICATION_TYPE } from './constants';


export async function sendNotification(options: ISendNotificationInputOptions) {
  try {
    const {
      signer,
      chainId,
      type,
      identityType,
      payload,
      recipients,
      channel,
      dev,
      // newly added PROPS: TODO: check about these
      graph,
      ipfsHash,   
    } = options || {};

    const uuid = getUUID();

    if (type === NOTIFICATION_TYPE.BROADCAST && !channel) {
      throw '[EPNS-SDK] - Error - sendNotification() - "channel" mandatory for Notification Type: Broadcast!';
    }

    const _channel = channel || signer.address;

    const epnsConfig = getEpnsConfig(chainId, dev);
    const _recipients = await getRecipients(chainId, type, recipients, payload?.sectype, _channel);
    const notificationPayload = getPayloadForAPIInput(options, _recipients);

    const verificationProof = await getVerificationProof({
      signer,
      chainId,
      identityType,
      notificationType: type,
      verifyingContract: epnsConfig.EPNS_COMMUNICATOR_CONTRACT,
      payload: notificationPayload,
      graph,
      ipfsHash,
      uuid
    });

    const identity = getPayloadIdentity({
      identityType,
      payload: notificationPayload,
      notificationType: type,
      graph,
      ipfsHash
    });

    const source = getSource(chainId, identityType);
   
    const apiPayload = {
      verificationProof,
      identity,
      channel: getCAIPFormat(chainId, _channel),
      source,
      /** note this recipient key has a different expectation from the BE API, see the funciton for more */
      recipient: getRecipientFieldForAPIPayload({
        chainId,
        notificationType: type,
        recipients: recipients || '',
        channel: _channel
      })
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
    console.error('[EPNS-SDK] - Error - sendNotification() - ', JSON.stringify(err));
    throw err;
  }
}