import * as AWS from 'aws-sdk';
import * as AWS_CONFIG from '../config/AWS.json';
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export module SmsService {

    const AWS_REGION = 'us-east-1';
    const SENDER_ID = 'SENDER_NAME';
    const APPLICATION_ID = 'APPLICATION_ID';
    AWS.config.update({ region: AWS_REGION, ...AWS_CONFIG });
    const pinpoint = new AWS.Pinpoint();


    export const sendSms = async (phoneNumber, message) => {

        const phoneNumberObject: any = parsePhoneNumberFromString(phoneNumber,'US');
        if (!phoneNumberObject){
            throw new Error('Error, could not parse phone number for the sms!')
        }

        return new Promise((resolve, reject) => {

            const params: any = {
                ApplicationId: APPLICATION_ID,
                MessageRequest: {
                    Addresses: { [phoneNumberObject.number]: { ChannelType: 'SMS' } },
                    MessageConfiguration: {
                        SMSMessage: { Body: message, MessageType: 'TRANSACTIONAL', SenderId: SENDER_ID, }
                    }
                }
            };

            //Try to send the message.
            pinpoint.sendMessages(params, function (err, data) {
                if (err) {
                    return reject(err);

                }
                return resolve(data);
            });
        })
    }
}

