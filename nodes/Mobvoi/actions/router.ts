import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
	const returnData: INodeExecutionData[] = [];
	const items = this.getInputData();
	const operation = this.getNodeParameter('operation', 0);

	let response: INodeExecutionData;
	for (let i = 0; i < items.length; i++) {
		try {
			switch (operation) {
				case 'get_speaker_list':
					response = await get_speaker_list.call(this, i);
					returnData.push(response);
					break;
				case 'text_to_speech':
					response = await text_to_speech.call(this, i);
					returnData.push(response);
					break;
				case 'voice_clone':
					response = await voice_clone.call(this, i);
					returnData.push(response);
					break;
				case 'photo_drive_avatar':
					response = await photo_drive_avatar.call(this, i);
					returnData.push(response);
					break;
				case 'query_photo_drive_avatar':
					response = await query_photo_drive_avatar.call(this, i);
					returnData.push(response);
					break;
				case 'video_dubbing':
					response = await video_dubbing.call(this, i);
					returnData.push(response);
					break;
				case 'query_video_dubbing':
					response = await query_video_dubbing.call(this, i);
					returnData.push(response);
					break;
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

	return [returnData];
}

async function get_speaker_list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'tts.get_speaker_list');
	const response: INodeExecutionData = await await apiRequest.call(this, url, 'POST');
	return response;
}
//
async function text_to_speech(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'tts.text_to_speech');

	// params
	const text = this.getNodeParameter('text', i) as string;
	const speaker = this.getNodeParameter('speaker', i) as string;
	const audio_type = this.getNodeParameter('audio_type', i) as string;
	const speed = this.getNodeParameter('speed', i) as string;
	const rate = this.getNodeParameter('rate', i) as string;
	const volume = this.getNodeParameter('volume', i) as string;
	const pitch = this.getNodeParameter('pitch', i) as string;
	const streaming = this.getNodeParameter('streaming', i) as string;

	const response: INodeExecutionData = await apiRequest.call(this, url, 'POST', {
		text,
		speaker,
		audio_type,
		speed,
		rate,
		volume,
		pitch,
		streaming,
	});

	return response;
}
async function voice_clone(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'tts.voice_clone');

	// params
	const audio_file = this.getNodeParameter('audio_file', i) as string;

	const response: INodeExecutionData = await apiRequest.call(this, url, 'POST', {
		audio_file,
	});

	return response;
}
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

async function photo_drive_avatar(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'avatar.photo_drive_avatar');
	// params
	const imageUrl = this.getNodeParameter('imageUrl', i) as string;
	const audioUrl = this.getNodeParameter('audioUrl', i) as string;
	const response: INodeExecutionData = await apiRequest.call(this, url, 'POST', {
		imageUrl,
		audioUrl,
	});

	return response;
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
async function query_photo_drive_avatar(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'avatar.query_photo_drive_avatar');
	// params
	const task_id = this.getNodeParameter('task_id', i) as string;
	// const output_dir = this.getNodeParameter('output_dir', i) as string;
	const response = await apiRequest.call(this, `${url}/${task_id}`, 'GET', {});

	if (response.json) {
		// const data = Buffer.from(responseData.body as string);
		// items[i].binary![dataPropertyNameDownload] = await this.helpers.prepareBinaryData(
		// 	data as unknown as Buffer,
		// 	fileName as string,
		// 	mimeType,
		// );
	}

	return response;
}

async function video_dubbing(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'avatar.video_dubbing');
	// params
	const videoUrl = this.getNodeParameter('video_url', i) as string;
	const wavUrl = this.getNodeParameter('audio_url', i) as string;
	const response: INodeExecutionData = await apiRequest.call(this, url, 'POST', {
		videoUrl,
		wavUrl,
	});

	return response;
}
async function query_video_dubbing(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData> {
	const url = await getServiceUrl.call(this, 'avatar.query_video_dubbing');
	// params
	const task_id = this.getNodeParameter('task_id', i) as string;
	// const output_dir = this.getNodeParameter('output_dir', i) as string;
	const response = await apiRequest.call(
		this,
		url,
		'GET',
		{},
		{ taskId: task_id, taskUuid: task_id },
	);

	if (response.json) {
		// const data = Buffer.from(responseData.body as string);
		// items[i].binary![dataPropertyNameDownload] = await this.helpers.prepareBinaryData(
		// 	data as unknown as Buffer,
		// 	fileName as string,
		// 	mimeType,
		// );
	}

	return response;
}
