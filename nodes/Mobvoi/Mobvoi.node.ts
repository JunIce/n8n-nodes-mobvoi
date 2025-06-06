import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { router } from './actions/router';

export class Mobvoi implements INodeType {
	description: INodeTypeDescription;
	mainlandTtsHost = 'https://open.mobvoi.com';
	mainlandAvatarHost = 'https://openman.weta365.com/metaman/open';

	constructor() {
		this.description = {
			displayName: 'Mobvoi',
			name: 'mobvoi',
			icon: 'file:mobvoi.svg',
			group: ['transform'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Interact with Mobvoi API',
			defaults: {
				name: 'Mobvoi',
			},
			inputs: [NodeConnectionType.Main],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'mobvoiApi',
					required: true,
				},
			],
			requestDefaults: {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			},
			/**
			 * In the properties array we have two mandatory options objects required
			 *
			 * [Resource & Operation]
			 *
			 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
			 *
			 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
			 * to keep this class easy to read.
			 *
			 */
			properties: [
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Get Speaker List',
							value: 'get_speaker_list',
							action: 'Get speaker list',
						},
						{
							name: 'Text to Speech',
							value: 'text_to_speech',
							action: 'Text to speech',
						},
						{
							name: 'Voice Clone',
							value: 'voice_clone',
							action: 'Voice clone',
						},
					],
					default: 'get_speaker_list',
				},
				// get_speaker_list
				{
					displayName: 'Speaker Type',
					name: 'voice_type',
					default: 'all',
					required: true,
					displayOptions: {
						show: {
							operation: ['get_speaker_list'],
						},
					},
					type: 'options',
					placeholder: 'Select Speaker Type',
					options: [
						{
							name: 'All',
							value: 'all',
							description: 'All Speakers',
						},
						{
							name: 'System',
							value: 'system',
							description: 'System Speakers',
						},
						{
							name: 'Voice Cloning',
							value: 'voice_cloning',
							description: 'Voice Cloning Speakers',
						},
					],
				},
				// text_to_speech
				{
					displayName: 'Text',
					name: 'text',
					default: '',
					required: true,
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Speaker',
					name: 'speaker',
					default: 'xiaoyi_meet',
					required: true,
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Audio_type',
					name: 'audio_type',
					default: 'mp3',
					required: true,
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Speed',
					name: 'speed',
					default: '1.0',
					required: true,
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Rate',
					name: 'rate',
					default: '24000',
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Volume',
					name: 'rate',
					default: '1',
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Pitch',
					name: 'rate',
					default: '0.0',
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'Streaming',
					name: 'rate',
					default: false,
					displayOptions: {
						show: {
							operation: ['text_to_speech'],
						},
					},
					type: 'boolean',
				},

				// voice_clone
				{
					displayName: 'wavUri',
					name: 'wavUri',
					default: '',
					displayOptions: {
						show: {
							operation: ['voice_clone'],
						},
					},
					type: 'string',
				},
				{
					displayName: 'File Path',
					name: 'file',
					default: '',
					displayOptions: {
						show: {
							operation: ['voice_clone'],
						},
					},
					type: 'resourceLocator',
				},
			],
		};
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
		return await router.call(this);
	}
}
