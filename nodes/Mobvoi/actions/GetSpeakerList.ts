import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';
import { MobvoiResponse } from './node.type';

export async function get_speaker_list(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'tts.get_speaker_list');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const response = (await apiRequest.call(this, url, 'POST', {})) as MobvoiResponse;

			if (!response.success) {
				throw new Error(`Error: ${response?.message}`);
			}

			const voice_type = this.getNodeParameter('voice_type', i) as string;

			let responseData: IDataObject[];
			switch (voice_type) {
				case 'system':
					responseData = response['data']['systemVoice'];
					break;
				case 'voice_cloning':
					responseData = response['data']['voiceCloning'];
					break;
				default:
					responseData = response['data'];
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData),
				{
					itemData: { item: i },
				},
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
