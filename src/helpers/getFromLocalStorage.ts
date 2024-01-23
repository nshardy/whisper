export const getNotes = () =>
    JSON.parse(localStorage.getItem("whisper") || "");

export const setNotes = (value: string): void =>
    localStorage.setItem("whisper", value);