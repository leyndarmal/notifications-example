import { models } from 'database/database';
import * as request from 'request';
import { EmailService } from './emailService';
import * as moment from 'moment';
import { SmsService } from './smsService';

export module GreetingService {


    export const sendWelcomeSMS = async (options) => {

        const { entityId, link, orgId, phoneNumber } = options;

        const entity = await models.Entity.findOne({ _id: entityId })
            .lean()
            .exec();

        const { firstName } = entity.entity.name;
        const { orgName } = await models.Organization.findOne({ _id: orgId })
            .select()
            .lean()
            .exec();

        const message = `Hi ${firstName},\nClick here to start:\n${link}`;
        const answer = await SmsService.sendSms(phoneNumber, message);

        return answer
    }


    export const sendWelcomeEmail = async (options) => {

        const templateName = 'WELCOME_EMAIL';

        const emailConfig = await EmailService.getEmailConfig(templateName);
        const substitutions = await EmailService.loadSubstitutionsAndTemplateId(emailConfig, templateName, options);

        const emailReceiverAndSender = await EmailService.loadEmailReceiverAndSenderDefault(options.email);
        let email = EmailService.buildEmail(emailConfig, substitutions, emailReceiverAndSender);
        await EmailService.sendToMailGun(email);
        return { succeeded: true, sent: true, message: '' };
    }
}