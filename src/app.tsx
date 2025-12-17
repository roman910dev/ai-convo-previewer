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
	  }
	| {
			success: false
			error: string
			messages?: undefined
	  }

function App() {
	const [state, setState] = useState<State>({
		success: true,
		messages: [],
	})
	const onMessagesChange = (input: string) => {
		try {
			const messages = JSON.parse(input)

			console.log('updating...')
			setState({ success: true, messages })
		} catch (error) {
			console.error(error)
			setState({ success: false, error: 'Invalid JSON' })
		}
	}

	return (
		<div className="flex">
			<div className="flex h-dvh w-full max-w-2xl flex-col border-r">
				<Textarea
					className="w-full flex-1 rounded-none border-none font-mono"
					onChange={(e) => onMessagesChange(e.target.value)}
				/>
				<div className="w-full border-t px-4 py-2">
					{
						<div
							className={cn(
								'font-mono',
								state.error ? 'text-destructive' : (
									'text-transparent'
								),
							)}
						>
							{state.error ?? '.'}
						</div>
					}
				</div>
			</div>
			<ChatbotDemo messages={state.messages ?? []} />
		</div>
	)
}

export default App
