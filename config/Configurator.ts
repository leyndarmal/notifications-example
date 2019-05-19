import * as config from './config.json'


let instance = null;

export class Configurator {

    config: any;
    _env: string;

    constructor() {
        this.config = config;

        this.env = process.env.envType;

        if (!instance) instance = this;

        return instance;
    }

    set env(env) { this._env = env }
    get env() { return this._env }

    getWhatsAppConfig() {
        return this.config['whatsApp'];
    }

    getEmailTemplates(){
        return 'someComplexHTML';
    }

    
    getProfile() {

        switch (this.env) {
            case 'dev':
                return 'dev';
            case 'stage':
                return 'stage';
            case 'prod':
                return 'prod';
            default:
                return 'dev';
        }

    }

    getMailgunConfig() {
        return {
            apiKey: this.config['mailgunApiKey'],
            domain: this.config[this.getProfile()]['mailgunDomain']
        };
    }
}
