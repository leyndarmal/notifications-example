import { Configurator } from '../config/configurator';
import * as http from 'http';

const configurator = new Configurator();

export module WhatsAppService {

    const whatsAppConfig = configurator.getWhatsAppConfig();

    export const sendMessage = async (groupName, message) => {

        return new Promise((resolve, reject) => {

            let payload = JSON.stringify({
                group_admin: 'adminNumber',
                group_name: groupName,
                message: message
            })

            let options = {
                hostname: 'api.whatsmate.net',
                port: 80,
                path: `/v3/whatsapp/group/text/message/${whatsAppConfig.id}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WM-CLIENT-ID': whatsAppConfig.clientId,
                    'X-WM-CLIENT-SECRET': whatsAppConfig.clientSecret,
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            let request = new http.ClientRequest(options);
            request.end(payload);

            request.on('response', response => {
                if (response.statusCode < 200 || response.statusCode > 300)
                    return reject(new Error(`statusCode ${response.statusCode}`));

                response.setEncoding('utf8');
                response.on('data', chunk => {
                    return resolve(chunk);
                });
            });

            request.on('error', err => {
                return reject(err);
            })
        })
    }
}