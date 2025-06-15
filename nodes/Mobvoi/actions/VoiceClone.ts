import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';
import { MobvoiResponse } from './node.type';

export async function voice_clone(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'tts.voice_clone');
	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			// params
			const is_url = this.getNodeParameter('is_url', i) as boolean;
			const audio_file = this.getNodeParameter('audio_file', i) as string;

			const body: { wavUri?: string; file?: string } = {};
			if (is_url) {
				body.wavUri = audio_file;
			} else {
				body.file = audio_file;
			}

			const response = await apiRequest.call(this, url, 'POST', body, {
				'content-type': 'multipart/form-data',
			}) as MobvoiResponse;

			items[i].json['speaker'] = response.speaker;

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(items[i]),
				{ itemData: { item: i } },
			);

			returnData = returnData.concat(executionData);
		} catch (error) {
			if (
				error.description &&
				(error.description as string).includes('cannot accept the provided value')
			) {
				error.description = `${error.description}. Consider using 'Typecast' option`;
			}
			throw error;
		}
	}

	return returnData;
}
