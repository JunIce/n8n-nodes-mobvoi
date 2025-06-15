import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { get_speaker_list } from './GetSpeakerList';
import { text_to_speech } from './TextToSpeech';
import { voice_clone } from './VoiceClone';
import { photo_drive_avatar, query_photo_drive_avatar } from './photo';
import { query_video_dubbing, video_dubbing } from './video';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const items = this.getInputData();
	const operation = this.getNodeParameter('operation', 0);

	switch (operation) {
		case 'get_speaker_list':
			returnData.push(...(await get_speaker_list.call(this, items)));
			break;
		case 'text_to_speech':
			returnData.push(...(await text_to_speech.call(this, items)));
			break;
		case 'voice_clone':
			returnData.push(...(await voice_clone.call(this, items)));
			break;
		case 'photo_drive_avatar':
			returnData.push(...(await photo_drive_avatar.call(this, items)));
			break;
		case 'query_photo_drive_avatar':
			returnData.push(...(await query_photo_drive_avatar.call(this, items)));
			break;
		case 'video_dubbing':
			returnData.push(...(await video_dubbing.call(this, items)));
			break;
		case 'query_video_dubbing':
			returnData.push(...(await query_video_dubbing.call(this, items)));
			break;
	}

	return [returnData];
}
