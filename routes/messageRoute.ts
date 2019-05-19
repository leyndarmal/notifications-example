import * as Sentry from '@sentry/node';
import { EmailService } from '../services/emailService';
import { CHANNELS_ENUM } from 'database/enums/enums';
import {MessagingClient} from 'infra/messaging/messagingClient'


MessagingClient.subscribe('notification.queue', CHANNELS_ENUM.NOTIFICATION_CHANNEL, async (err, message) => {

    let data = message.data;
    let type = data.type;
    let answer;

    if (!type) return;

    Sentry.withScope(async scope => {

        scope.setExtra('payload', data);

        try {

            switch (type) {

                case 'SENDING_EMAIL': {

                    let { templateName, userId, options } = data;
                    answer = await EmailService.sendEmail(templateName, userId, options);
                    break;
                }

                default:
                    break;
            }

        } catch (err) {

            Sentry.captureException(err)
        }
    })
});