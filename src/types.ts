/**
 * MODEL	DESCRIPTION	CONTEXT WINDOW	TRAINING DATA
 * gpt-4-0125-preview	New GPT-4 Turbo
 * The latest GPT-4 model intended to reduce cases of “laziness” where the model doesn’t complete a task. Returns a maximum of 4,096 output tokens. Learn more.	128,000 tokens	Up to Dec 2023
 * gpt-4-turbo-preview	Currently points to gpt-4-0125-preview.	128,000 tokens	Up to Dec 2023
 * gpt-4-1106-preview	GPT-4 Turbo model featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens. This is a preview model. Learn more.	128,000 tokens	Up to Apr 2023
 * gpt-4-vision-preview	GPT-4 with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. Currently points to gpt-4-1106-vision-preview.	128,000 tokens	Up to Apr 2023
 * gpt-4-1106-vision-preview	GPT-4 with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. Returns a maximum of 4,096 output tokens. This is a preview model version. Learn more.	128,000 tokens	Up to Apr 2023
 * gpt-4	Currently points to gpt-4-0613. See continuous model upgrades.	8,192 tokens	Up to Sep 2021
 * gpt-4-0613	Snapshot of gpt-4 from June 13th 2023 with improved function calling support.	8,192 tokens	Up to Sep 2021
 * gpt-4-32k	Currently points to gpt-4-32k-0613. See continuous model upgrades. This model was never rolled out widely in favor of GPT-4 Turbo.	32,768 tokens	Up to Sep 2021
 * gpt-4-32k-0613	Snapshot of gpt-4-32k from June 13th 2023 with improved function calling support. This model was never rolled out widely in favor of GPT-4 Turbo.	32,768 tokens	Up to Sep 2021
 * For many basic tasks, the difference between GPT-4 and GPT-3.5 models is not significant. However, in more complex reasoning situations, GPT-4 is much more capable than any of our previous models.
 *
 * Multilingual capabilities
 * GPT-4 outperforms both previous large language models and as of 2023, most state-of-the-art systems (which often have benchmark-specific training or hand-engineering). On the MMLU benchmark, an English-language suite of multiple-choice questions covering 57 subjects, GPT-4 not only outperforms existing models by a considerable margin in English, but also demonstrates strong performance in other languages.
 *
 * GPT-3.5 Turbo
 * GPT-3.5 Turbo models can understand and generate natural language or code and have been optimized for chat using the Chat Completions API but work well for non-chat tasks as well.
 *
 * MODEL	DESCRIPTION	CONTEXT WINDOW	TRAINING DATA
 * gpt-3.5-turbo-0125	New Updated GPT 3.5 Turbo
 * The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls. Returns a maximum of 4,096 output tokens. Learn more.	16,385 tokens	Up to Sep 2021
 * gpt-3.5-turbo	Currently points to gpt-3.5-turbo-0125.	16,385 tokens	Up to Sep 2021
 * gpt-3.5-turbo-1106	GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens. Learn more.	16,385 tokens	Up to Sep 2021
 * gpt-3.5-turbo-instruct	Similar capabilities as GPT-3 era models. Compatible with legacy Completions endpoint and not Chat Completions.	4,096 tokens	Up to Sep 2021
 * gpt-3.5-turbo-16k	Legacy Currently points to gpt-3.5-turbo-16k-0613.	16,385 tokens	Up to Sep 2021
 * gpt-3.5-turbo-0613	Legacy Snapshot of gpt-3.5-turbo from June 13th 2023. Will be deprecated on June 13, 2024.	4,096 tokens	Up to Sep 2021
 * gpt-3.5-turbo-16k-0613	Legacy Snapshot of gpt-3.5-16k-turbo from June 13th 2023. Will be deprecated on June 13, 2024.	16,385 tokens	Up to Sep 2021
 *
 */
type OPEN_AI_MODELS =
	| 'gpt-4-0125-preview'
	| 'gpt-4-turbo-preview'
	| 'gpt-4-1106-preview'
	| 'gpt-4-vision-preview'
	| 'gpt-4-1106-vision-preview'
	| 'gpt-4'
	| 'gpt-4-0613'
	| 'gpt-4-32k'
	| 'gpt-4-32k-0613'
	| 'gpt-3.5-turbo-0125'
	| 'gpt-3.5-turbo'
	| 'gpt-3.5-turbo-1106'
	| 'gpt-3.5-turbo-instruct'
	| 'gpt-3.5-turbo-16k'
	| 'gpt-3.5-turbo-0613'
	| 'gpt-3.5-turbo-16k-0613';
