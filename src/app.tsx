import type { UIMessage } from 'ai'
import debounce from 'debounce'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import ChatbotDemo from './components/chatbot-demo'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from './components/ui/resizable'
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

const makeId = (object: unknown, index: number) =>
	window.crypto.subtle
		.digest(
			'SHA-256',
			new TextEncoder().encode(`${JSON.stringify(object)}-${index}`),
		)
		.then((hash) =>
			Array.from(new Uint8Array(hash))
				.map((b) => b.toString(16).padStart(2, '0'))
				.join(''),
		)

function App() {
	const [state, setState] = useState<State>({
		success: true,
		messages: [],
	})

	const makeError = (error: string, details?: string) =>
		setState({ success: false, error, errorDetails: details ?? '' })

	const onMessagesChange = async (input: string) => {
		const data = fallback(
			(): UIMessage[] => JSON.parse(input),
			(e) => makeError('Invalid JSON', e?.toString()),
		)
		if (!data) return
		const uniqueIdMessages = await fallback(
			() =>
				Promise.all(
					data.map(async (message, i) => ({
						...message,
						id: await makeId(message, i),
					})),
				),
			(e) => makeError('Invalid messages', e?.toString()),
		)
		if (!uniqueIdMessages) return

		setState({ success: true, messages: uniqueIdMessages })
	}

	const debouncedOnMessagesChange = debounce(
		(input: string) => onMessagesChange(input),
		400,
	)

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel defaultSize={50} minSize={20}>
				<div className="flex h-dvh w-full flex-col border-r">
					<Textarea
						placeholder="Paste your `UIMessage[]` here"
						className="w-full flex-1 rounded-none border-none font-mono"
						onChange={(e) =>
							debouncedOnMessagesChange(e.target.value)
						}
					/>
					<div
						title={state.errorDetails}
						className={cn(
							'w-full border-t px-4 py-2 font-mono',
							state.errorDetails && 'cursor-help',
							state.success ?
								'text-muted-foreground'
							:	'text-destructive bg-destructive/15',
						)}
					>
						{state.success ?
							'OK'
						:	(state.error ?? 'Something went wrong')}
					</div>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50} minSize={20}>
				<ErrorBoundary
					fallbackRender={({ resetErrorBoundary }) => {
						if (state.success) resetErrorBoundary()
						return <ChatbotDemo messages={[]} />
					}}
					onError={(e) =>
						makeError('Invalid `UIMessage[]`', e.message)
					}
				>
					<ChatbotDemo messages={state.messages ?? []} />
				</ErrorBoundary>
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

export default App
