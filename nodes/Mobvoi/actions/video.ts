import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';

export async function video_dubbing(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'avatar.video_dubbing');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			// params
			const videoUrl = this.getNodeParameter('video_url', i) as string;
			const wavUrl = this.getNodeParameter('audio_url', i) as string;
			const response = (await apiRequest.call(this, url, 'POST', {
				videoUrl,
				wavUrl,
			})) as { taskId?: string };

			if (!response) {
				throw new Error('Failed to call photo drive avatar service');
			}

			if (response?.taskId) {
				returnData.push({
					json: {
						taskId: response.taskId,
					},
				});
			} else {
				throw new Error('Failed to get task id');
			}
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

export async function query_video_dubbing(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'avatar.query_video_dubbing');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			// params
			const task_id = this.getNodeParameter('task_id', i) as string;
			// const output_dir = this.getNodeParameter('output_dir', i) as string;
			const response = (await apiRequest.call(
				this,
				url,
				'GET',
				{},
				{ taskId: task_id, taskUuid: task_id },
			)) as any;

			if (response.json) {
				// const data = Buffer.from(responseData.body as string);
				// items[i].binary![dataPropertyNameDownload] = await this.helpers.prepareBinaryData(
				// 	data as unknown as Buffer,
				// 	fileName as string,
				// 	mimeType,
				// );
			}
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
