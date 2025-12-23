import type { UIMessage } from 'ai'
import debounce from 'debounce'
import { EraserIcon, ListMinusIcon } from 'lucide-react'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import ChatbotDemo from './components/chatbot-demo'
import { Button } from './components/ui/button'
import { ButtonGroup } from './components/ui/button-group'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from './components/ui/resizable'
import { Textarea } from './components/ui/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from './components/ui/tooltip'
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

const formatJSON = (jsonStr: string) =>
	JSON.stringify(JSON.parse(jsonStr), null, 2)

const autoJSON = (input: string) => {
	if (
		!(
			(input.startsWith('{') && input.endsWith('}')) ||
			(input.startsWith('[') && input.endsWith(']'))
		)
	)
		return input
	try {
		return [
			'```json',
			'// auto-detected JSON message',
			formatJSON(input),
			'```',
		].join('\n')
	} catch {
		return input
	}
}

function App() {
	const [input, setInput] = useState('')
	const [state, setState] = useState<State>({ success: true, messages: [] })

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
						parts: message.parts.map((p) =>
							p.type === 'text' ?
								{ ...p, text: autoJSON(p.text ?? '') }
							:	p,
						),
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
				<div className="relative flex h-dvh w-full flex-col border-r">
					<Textarea
						placeholder="Paste your `UIMessage[]` here"
						className="w-full flex-1 rounded-none border-none pb-12 font-mono"
						value={input}
						onChange={(e) => {
							setInput(e.target.value)
							debouncedOnMessagesChange(e.target.value)
						}}
					/>
					<div
						title={state.errorDetails}
						className={cn(
							'relative w-full border-t px-4 py-3 font-mono transition-colors',
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
					{input && (
						<ButtonGroup className="text-foreground animate-in fade-in zoom-in-95 absolute bottom-14 left-1/2 -translate-x-1/2 duration-150">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										disabled={!state.success}
										onClick={() => {
											if (!state.success) return
											try {
												setInput(formatJSON(input))
											} catch {
												// do nothing
											}
										}}
									>
										<ListMinusIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Format JSON</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										onClick={() => setInput('')}
									>
										<EraserIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Clear input</TooltipContent>
							</Tooltip>
						</ButtonGroup>
					)}
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
