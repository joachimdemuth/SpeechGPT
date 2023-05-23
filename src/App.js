import React, { useEffect } from 'react';
import styled from 'styled-components';
import SpeechRecognition, {
	useSpeechRecognition,
} from 'react-speech-recognition';
import './App.css';
import { MdMic } from 'react-icons/md';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

function App() {
	const [value, setValue] = React.useState('');
	const [answer, setAnswer] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
	} = useSpeechRecognition();

	useEffect(() => {
		setValue(transcript);
	}, [transcript]);

	const requestBody = {
		model: 'gpt-3.5-turbo',
		messages: [
			{ role: 'system', content: 'You are a helpful assistent.' },
			{ role: 'user', content: value },
		],
		max_tokens: 500,
		temperature: 0.9,
		top_p: 1,
		frequency_penalty: 0.0,
		presence_penalty: 0.6,
		stop: ['\n', ' Human:', ' AI:'],
	};
	const testBody = {
		model: 'gpt-3.5-turbo',
		messages: [
			{ role: 'system', content: 'You are a helpful assistent.' },
			{ role: 'user', content: 'What is the meaning of life?' },
		],
		max_tokens: 500,
		temperature: 0.9,
		top_p: 1,
		frequency_penalty: 0.0,
		presence_penalty: 0.6,
		stop: ['\n', ' Human:', ' AI:'],
	};
	const openai = axios.create({
		baseURL: 'https://api.openai.com/v1/chat/completions',
		headers: {
			Authorization:
				`Bearer ${process.env.OPENAI_API_KEY}`,
				'Content-Type': 'application/json',
		},
	});

	if (!browserSupportsSpeechRecognition) {
		return <span>Browser doesn't support speech recognition.</span>;
	}

	const handleMouseDown = () => {
		resetTranscript();
		setAnswer('');
		SpeechRecognition.startListening();
	};
	const handleMouseUp = async () => {
		SpeechRecognition.stopListening();

		if (value) {
			setLoading(true);
			const res = await openai.post('', requestBody);

			setAnswer(res.data.choices[0].message.content);
			setLoading(false);
		} else {
			return;
			// setLoading(true);
			// const res = await openai.post('', testBody);
			// setAnswer(res.data.choices[0].message.content);
			// setLoading(false);
		};
	};

	return (
		<Container>
			<Title>TalkGPT</Title>
			<TranscriptContainer>
				<TranscriptTitle>Your question:</TranscriptTitle>
				<Transcript>
					{value.charAt(0).toUpperCase() + value.slice(1)}
				</Transcript>
			</TranscriptContainer>
			<AnswerContainer>
				<AnswerTitle>Answer:</AnswerTitle>
				{loading ? (
					<p>Loading answer...</p>
				) : (
					<>
						<Answer>{answer}</Answer>
					</>
				)}
			</AnswerContainer>
			<ButtonContainer>
				<Button onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
					<MdMic size={48} color='white' />
				</Button>
				<Explainer>Hold down the button to start speaking</Explainer>
			</ButtonContainer>
			{/* <button onClick={resetTranscript}>Reset</button> */}
		</Container>
	);
}

export default App;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	gap: 64px;
	padding-top: 48px;
	width: 100%;
	height: 100vh;
	background: rgb(237, 236, 255);
	background: linear-gradient(
		137deg,
		rgba(237, 236, 255, 1) 0%,
		rgba(253, 255, 240, 1) 50%,
		rgba(220, 232, 255, 1) 100%
	);
`;

const Title = styled.h1`
	font-size: 3rem;
	margin-top: 20px;
	margin-bottom: 20px;
	color: #04125c;
`;

const Explainer = styled.p`
	font-size: 0.8rem;

	margin-bottom: 20px;
	color: grey;
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
	height: 100%;
`;
const Button = styled.button`
	display: flex;
	align-items: center;
	background: #938fff;
	color: #fff;
	height: 80px;
	width: 80px;
	justify-content: center;
	margin: 0 auto;
	padding: 10px;
	border-radius: 50%;
	border: none;
	outline: none;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	&:hover {
		transform: scale(1.1);
		transition: all 0.2s ease-in-out;
	}

	&:active {
		transform: scale(0.9);

		animation: pulse 1s infinite;

		@keyframes pulse {
			0% {
				transform: scale(0.95);
				box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
			}
			100% {
				transform: scale(1);
				box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
			}

	}
`;

const TranscriptContainer = styled.div`
	display: flex;
	width: 80%;
	flex: 1;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 16px;
`;

const TranscriptTitle = styled.p`
	font-size: 1rem;
	color: grey;
	margin: 0;
`;

const Transcript = styled.p`
	font-size: 1.2rem;
	margin: 0;
`;

const AnswerContainer = styled.div`
	display: flex;
	width: 80%;
flex:1;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 16px;
`;

const AnswerTitle = styled.p`
	font-size: 1rem;
	color: grey;
	margin: 0;
`;

const Answer = styled.p`
	font-size: 1.2rem;
	margin: 0;
`;
