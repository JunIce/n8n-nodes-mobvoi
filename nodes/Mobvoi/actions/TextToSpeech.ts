import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, getServiceUrl } from '../GenericFunction';
import { MobvoiResponse } from './node.type';

export async function text_to_speech(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const url = await getServiceUrl.call(this, 'tts.text_to_speech');

	let returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			// params
			const text = this.getNodeParameter('text', i) as string;
			const speaker = this.getNodeParameter('speaker', i) as string;
			const audio_type = this.getNodeParameter('audio_type', i) as string;
			const speed = this.getNodeParameter('speed', i) as string;
			const rate = this.getNodeParameter('rate', i) as string;
			const volume = this.getNodeParameter('volume', i) as string;
			const pitch = this.getNodeParameter('pitch', i) as string;
			const streaming = this.getNodeParameter('streaming', i) as string;

			const response = (await apiRequest.call(this, url, 'POST', {
				text,
				speaker,
				audio_type,
				speed,
				rate,
				volume,
				pitch,
				streaming,
			})) as MobvoiResponse;

			if (!response.content) {
				throw new Error('No content in response');
			}

			if (response.content.length < 100) {
				throw new Error('Failed to get audio data from text to speech service');
			}

			const fileContent = Buffer.from(response.content);

			const fileName = `tts_${speaker.replace(/\s+/, '_')}_${i}.mp3`;

			await this.helpers.writeContentToFile(fileName, fileContent, 'w');

			const binaryData = await this.helpers.prepareBinaryData(fileContent, fileName);

			binaryData.mimeType = 'audio/mpeg';

			binaryData.fileExtension = 'mp3';

			returnData.push({
				binary: {
					data: binaryData,
				},
				json: {
					mimeType: binaryData.mimeType,
					fileType: binaryData.fileType,
					fileName: binaryData.fileName,
					directory: binaryData.directory,
					fileExtension: binaryData.fileExtension,
					fileSize: binaryData.fileSize,
				},
				pairedItem: {
					item: i,
				},
			});
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
