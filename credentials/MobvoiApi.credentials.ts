import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MobvoiApi implements ICredentialType {
	name = 'mobvoiApi';
	displayName = 'Mobvoi API';
	documentationUrl = 'https://openapi.moyin.com/user/mine-app-detail';
	properties: INodeProperties[] = [
		{
			displayName: 'APP_KEY',
			name: 'app_key',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'APP_SECRET',
			name: 'app_secret',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'APP_REGION',
			name: 'app_region',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];
}
