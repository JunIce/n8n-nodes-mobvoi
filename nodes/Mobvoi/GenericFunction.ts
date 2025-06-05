import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { createHash } from 'crypto';

function generateSignature(appKey: string, appSecret: string) {
	const timestamp = Math.floor(Date.now() / 1000); // current timestamp
	const signatureString = `${appKey}+${appSecret}+${timestamp}`; // base hash string
	const hash = createHash('md5').update(signatureString).digest('hex'); // signature

	return {
		appKey: appKey,
		signature: hash,
		timestamp: timestamp.toString(),
	};
}

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	uri: string,
	method: IHttpRequestMethods,
	body: any = {},
	qs: any = {},
	option: IDataObject = {},
): Promise<any> {
	const mobvoiCridentials = await this.getCredentials('mobvoiApi');
	// get and generate signature
	const app_key = mobvoiCridentials.app_key as string;
	const app_secrect = mobvoiCridentials.app_secrect as string;
	const signature = generateSignature(app_key, app_secrect);
	// options
	let options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body: Object.assign({}, body, signature),
		qs,
		url: uri,
		json: true,
	};
	options = Object.assign({}, options, option);

	try {
		return await this.helpers.httpRequest.call(this, options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function apiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	body: any = {},
	url: string,
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	query.limit = 100;
	query.offset = 0;
	do {
		responseData = await apiRequest.call(this, url, method, body, query);
		query.offset = (responseData.offset as number) + query.limit;
		returnData.push.apply(returnData, responseData[propertyName] as IDataObject[]);
	} while (responseData[propertyName].length !== 0);

	return returnData;
}

// service map
const mainland_tts_host = 'https://open.mobvoi.com';
const mainland_avatar_host = 'https://openman.weta365.com/metaman/open';

const serviceDict: Record<string, Record<string, string>> = {
	mainland: {
		'tts.get_speaker_list': `${mainland_tts_host}/api/tts/getSpeakerList`,
		'tts.text_to_speech': `${mainland_tts_host}/api/tts/v1`,
		'tts.voice_clone': `${mainland_tts_host}/clone`,
		'avatar.photo_drive_avatar': `${mainland_avatar_host}/image/toman/cmp`,
		'avatar.query_photo_drive_avatar': `${mainland_avatar_host}/image/toman/cmp/result/`,
		'avatar.video_dubbing': `${mainland_avatar_host}/video/voiceover/createTask`,
		'avatar.query_video_dubbing': `${mainland_avatar_host}/video/voiceover/detail`,
	},
	global: {},
};
// get service url
export async function getServiceUrl(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	key: string,
) {
	const mobvoiCridentials = await this.getCredentials('mobvoiApi');
	const region = mobvoiCridentials.app_region || 'mainland';
	const url = serviceDict[region as string][key];
	return url;
}
