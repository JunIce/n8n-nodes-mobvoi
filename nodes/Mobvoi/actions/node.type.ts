import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	tts: 'get_speaker_list' | 'text_to_speech' | 'voice_clone';
	avatar:
		| 'photo_drive_avatar'
		| 'query_photo_drive_avatar'
		| 'video_dubbing'
		| 'query_video_dubbing';
};

export type Mobvoi = AllEntities<NodeMap>;

export type MobvoiResponse = {
	code: number;
	message: string;
	success: boolean;
	data?: any;
	content?: string;
	speaker?: string;
};
