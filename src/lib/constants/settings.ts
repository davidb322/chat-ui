import { defaultModel } from "$lib/server/models";
import type { SettingsEditable } from "$lib/types/Settings";

export const DEFAULT_SETTINGS: SettingsEditable = {
        shareConversationsWithModelAuthors: true,
        activeModel: defaultModel.id,
        hideEmojiOnSidebar: false,
        customPrompts: {},
        assistants: [],
        tools: [],
        disableStream: false,
        directPaste: false,
};
