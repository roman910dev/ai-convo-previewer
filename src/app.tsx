import type { UIMessage } from 'ai'
import { useState } from 'react'

import ChatbotDemo from './components/chatbot-demo'
import { Textarea } from './components/ui/textarea'
import { cn } from './lib/utils'

type State =
	| {
			success: true
			messages: UIMessage[]
			error?: undefined
			errorDetails?: undefined
	  }
	| {
			success: false
			error: string
			errorDetails: string
			messages?: undefined
	  }

function fallback<T, Fallback>(
	fn: () => T,
	fallback: (error: unknown) => Fallback,
) {
	try {
		return fn()
	} catch (e) {
		return fallback(e)
	}
}

function App() {
	const [state, setState] = useState<State>({
		success: true,
		messages: [],
	})

	const makeError = (error: string, details?: string) =>
		setState({ success: false, error, errorDetails: details ?? '' })

	const onMessagesChange = (input: string) => {
		const data = fallback(
			(): UIMessage[] => JSON.parse(input),
			(e) => makeError('Invalid JSON', e?.toString()),
		)
		if (!data) return
		const uniqueIdMessages = fallback(
			() =>
				data.map((message) => ({
					...message,
					id: window.crypto.randomUUID(),
				})),
			(e) => makeError('Invalid messages', e?.toString()),
		)
		if (!uniqueIdMessages) return
		setState({ success: true, messages: uniqueIdMessages })
	}

	return (
		<div className="flex">
			<div className="flex h-dvh w-full max-w-2xl flex-col border-r">
				<Textarea
					className="w-full flex-1 rounded-none border-none font-mono"
					onChange={(e) => onMessagesChange(e.target.value)}
				/>
				<div
					title={state.errorDetails}
					className={cn(
						'w-full border-t px-4 py-2 font-mono',
						state.errorDetails && 'cursor-help',
						state.error ? 'text-destructive' : 'text-transparent',
					)}
				>
					{state.error ?? '.'}
				</div>
			</div>
			<ChatbotDemo messages={state.messages ?? []} />
		</div>
	)
}

export default App
