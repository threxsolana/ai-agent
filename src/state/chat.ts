import {atom} from "jotai";

export const chatAtom = atom<Array<Message> | null>(null);
export const isAgentThinkingAtom = atom<boolean>(false);
export const isAgentWritingResponseAtom = atom<boolean>(false);
