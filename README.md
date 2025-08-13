SongWeaver: Capsule-to-Audio Prompt Engine (Legacy Version)
Overview
SongWeaver is a specialized module designed to bridge narrative structures with generative audio creation. In its current form, it acts as a pipeline from capsule logic to musical realization, translating complex narrative elements into concise, expressive text prompts suitable for generative music platforms like Suno.ai.
This version of SongWeaver represents a foundational component of our modular creative ecosystem, enabling creators to transform symbolic narratives into sonic experiences. It is slated for integration into Quantum Forge in the near future, where it will contribute to a more centralized and streamlined creative workflow [User Query, 157].
Key Features (Current State)
• Capsule Manifest Translation: SongWeaver's core functionality involves converting structured Capsule Manifests into formatted text prompts that generative AI models, such as those used by Suno.ai, can interpret. This process allows for the direct utilization of narrative data within musical creation.
• Structured Prompt Generation: It generates prompts with defined elements including:
    ◦ Title and Tags: For clear identification and thematic categorization.
    ◦ Mood Description and Style Pack: Capturing the emotional essence and desired aesthetic (e.g., "Psychedelic Bloom", "Vintage Reverb", "Temporal Bloom").
    ◦ Instrumentation: Suggesting specific instruments or sonic textures (e.g., "Tape-warped synths", "Vinyl crackle textures").
    ◦ Musical Structure Notes: Providing guidance on the song's arrangement, such as intros, middle sections, ends, and cueBehavior (e.g., "Breathing Phase triggers amplitude dips and slow tempo shift").
    ◦ Emotional Profile and Glyph Influences: Incorporating deeper symbolic and emotional data from the source capsule.
• Prompt Queue Management: SongWeaver supports the management of PromptFrames in an export queue, facilitating the creation of phase-stacked capsule tracks.
• Integration with Capsule Data: The module directly leverages traitFlow, glyphStack, moodTags, and cueBehavior from capsules, ensuring that the generated prompts are deeply informed by the narrative's inherent qualities.
• Preview and Export Capabilities: Users can preview, edit, and export these formatted prompts, with options for direct API calls, copy-to-clipboard, or saving to a remix queue.
Future Integration with Quantum Forge
SongWeaver is positioned to become a fundamental component of Quantum Forge, our primary modular application [User Query, 521]. The merge aims to:
• Centralize Creative Tools: By integrating SongWeaver, Quantum Forge will consolidate audio prompt generation within its unified environment, reducing clutter and enhancing overall system coherence.
• Enhance Modular Narrative Composition: SongWeaver will function as a specialized plugin, leveraging Quantum Forge's robust hosting capabilities to contribute to modular narrative composition and flow sequencing. This means that narrative logic will directly influence sonic output within a cohesive framework.
• Streamline Workflow and Management: The integration will allow for more efficient management and versioning of SongWeaver's capabilities as part of the broader Quantum Forge ecosystem, similar to how Audio Architect is becoming an official plugin.
• Leverage Quantum Forge's Architecture: SongWeaver will benefit from Quantum Forge's established signal orchestration, node canvas zones, and sync APIs, creating a powerful synergy for creators.
This merge represents a significant step towards creating a comprehensive platform where stories breathe with your touch and gesture becomes story, truly realizing the vision of performing myth through motion, glyph, and memory.


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
