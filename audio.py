import os

from dotenv import load_dotenv
load_dotenv()

import assemblyai as aai
aai.settings.api_key = os.environ.get("ASSEMBLY_KEY")

import openai
openai.api_key = os.environ.get("OPEN_AI_API_KEY")

import time
def watcher(func):
	def wrapper(*args, **kwargs):
		time_i = time.time()
		print(f"Starting {func.__name__} ....... ", end="")
		result = func(*args, **kwargs)
		print(f"Done in {round(time.time() - time_i, 2)} seconds")
		return result
	return wrapper

# ----> THIS IS THE MAIN FUNCTION FOR TRANSCRIPTION AND DIARIZATION
def transcribe(file_path, num_speakers, lang):
	transcript = transcribe_assembly(file_path, num_speakers, lang)
	transcript = identify_speakers(transcript)
	description = describe(transcript)
	return transcript, description

@watcher
def transcribe_assembly(file_path, num_speakers, lang):

	config = aai.TranscriptionConfig(
		speaker_labels=True,
		speakers_expected=num_speakers,
		language_code=lang,
	)

	transcript = aai.Transcriber().transcribe(file_path, config)

	return [(utt.speaker, utt.text) for utt in transcript.utterances]

@watcher
def identify_speakers(transcript):
	start_convo, speakers_template = gpt_prepare(transcript)
	response = gpt_get_response(start_convo, speakers_template)
	try:
		speakers = gpt_parse_response(response)
	except Exception as e:
		print(e)
		speakers = {}
	new_transcription = gpt_embed_speakers(transcript, speakers, speakers_template)
	return new_transcription

@watcher
def describe(transcript):

	content = f"Following is the conversation, generate me a report on this: {transcript}"

	response = openai.ChatCompletion.create(
		model="gpt-3.5-turbo",
		messages=[{"role": "user", "content": content}],
		temperature=0.2,
	)

	description = response.choices[0].message["content"]

	return description

def gpt_prepare(transcription):
	conversation = transcription[:10]
	unique_speakers = sorted(list(set([i[0] for i in conversation])))
	speakers = {
		k: "<SPEAKER NAME>" for k in unique_speakers
	}
	return conversation, speakers

def gpt_get_response(conversation, speakers):
	content = [{"conversation": conversation, "speakers": speakers}]
	content = str(content)
	response = openai.ChatCompletion.create(
		model="gpt-3.5-turbo",
		messages=[{"role": "user", "content": content}],
		temperature=0,
	)
	return response

def gpt_parse_response(response):
	response = response.choices[0].message['content']
	response_de = eval(response)
	if type(response_de) == list:
		response_de = response_de[0]
	speakers = response_de.get("speakers", {})
	return speakers

def gpt_embed_speakers(transcript, speakers, speakers_template):
	final_transcription = []
	for speaker, said in transcript:
		speaker = speakers.get(
			speaker,
			f"Speaker {speakers_template.get(speaker)}"
		)
		final_transcription.append(
			f"{speaker}: {said}"
		)
	final_transcription = "\n".join(final_transcription)
	return final_transcription