import {
	IExecuteFunctions,
	INodeExecutionData,
	IBinaryKeyData,
	IDataObject,
	IN8nHttpFullResponse,
} from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';

/**
 * Generate a video from a given image URL and an audio URL. If a person is in the image, the video will be a talking head video, driven by the audio.
    It will consume some time to generate the video, wait with patience.
    It will return a text message indicating that the task is submitted successfully, task id will be returned.
    After getting the task id, you may use the query_photo_drive_avatar tool to query the result of the task.
    
    ⚠️ COST WARNING: This tool makes an API call to Mobvoi which may incur costs. Only use when explicitly requested by the user.

    Args:
        image_url: The URL of the image to use in the video.
        audio_url: The URL of the audio to use in the video.

    Returns:
        A text message indicating the success of the video generation task, task id will be returned if success.
 */

export async function photo_drive_avatar(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'avatar.photo_drive_avatar');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			// params
			const imageUrl = this.getNodeParameter('imageUrl', i) as string;
			const audioUrl = this.getNodeParameter('audioUrl', i) as string;
			const response = (await apiRequest.call(this, url, 'POST', {
				imageUrl,
				audioUrl,
			})) as { taskId?: string };

			if (!response) {
				throw new Error('Failed to call photo drive avatar service');
			}

			if (response?.taskId) {
				returnData.push({
					json: {
						taskId: response.taskId,
						audio_url: audioUrl,
						image_url: imageUrl,
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

/**
 * Query the result of the photo drive avatar task.
    It will return a text message indicating that the task is completed and the video is saved to the output directory.
    If the output directory is not specified, only result url will be returned.

    If the return status indiacting the task is still running, you may use this tool again after a while.

    Args:
        task_id: The task id of the photo drive avatar task.
        output_dir: The directory to save the generated video, you can send the absolute path of the current working directory.
                    The result will be saved into $output_dir/$task_id/result.mp4.

    Returns:
        A text message indicating the status of the task.
        Result url will be returned if success, saved path will be returned if output directory is specified.
 * @param this 
 * @param i 
 * @returns 
 */
export async function query_photo_drive_avatar(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'avatar.query_photo_drive_avatar');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			let item = items[i];
			// params
			const task_id = this.getNodeParameter('task_id', i) as string;
			const downloadOptions = this.getNodeParameter('options', i);

			const response = (await apiRequest.call(
				this,
				`${url}/${task_id}`,
				'GET',
				{},
				{},
				{
					useStream: true,
					returnFullResponse: true,
					encoding: 'arraybuffer',
					json: false,
				},
			)) as IN8nHttpFullResponse;

			const mimeType = (response.headers as IDataObject)?.['content-type'] ?? undefined;
			const fileName = downloadOptions.fileName ?? undefined;

			const newItem: INodeExecutionData = {
				json: item.json,
				binary: {},
			};

			if (item.binary !== undefined) {
				// Create a shallow copy of the binary data so that the old
				// data references which do not get changed still stay behind
				// but the incoming data does not get changed.
				Object.assign(newItem.binary as IBinaryKeyData, item.binary);
			}

			item = newItem;

			const dataPropertyNameDownload = (downloadOptions.binaryPropertyName as string) || 'data';

			item.binary![dataPropertyNameDownload] = await this.helpers.prepareBinaryData(
				response.body as Buffer,
				fileName as string,
				mimeType as string,
			);

			const executionData = this.helpers.constructExecutionMetaData([item], {
				itemData: { item: i },
			});
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
