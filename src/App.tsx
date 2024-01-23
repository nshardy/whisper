import "./App.scss";
import { useEffect, useState } from "react";
import { getNotes, setNotes as setNotesOnLocalStorage, } from "./helpers/getFromLocalStorage";
import dayjs from "dayjs";
import { writeTextFile, readTextFile, removeFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { GoDuplicate, GoNote, GoTrash } from "react-icons/go";

function App() {
  const [notes, setNotes] = useState<Array<Record<string, string>>>([]);
  const [activeNote, setActiveNote] = useState(0);
  const [activeNoteContent, setActiveNoteContent] = useState("");

  const updateNotes = (notes: Array<Record<string, string>>) => {
    setNotes([...notes]);
    setNotesOnLocalStorage(JSON.stringify(notes));
  }

  const deleteNote = async (noteID: number) => {
    await removeFile(notes[noteID].location);

    notes.splice(noteID, 1);
    updateNotes(notes);

    if (activeNote >= noteID)
      setActiveNoteData(activeNote >= 1 ? activeNote - 1 : 0);
  }

  const addNote = async () => {
    const savePath = await save();
    if (!savePath)
      return;

    await writeTextFile(`${savePath}.txt`, "");

    const newNote = {
      title: "New Note",
      created_at: `${dayjs().format("ddd, MM/DD/YYYY")} at ${dayjs().format("hh:mm A")}`,
      location: `${savePath}.txt`
    }

    updateNotes([{ ...newNote }, ...notes]);
    setActiveNote(0);
    setActiveNoteContent("");
  }

  const handleChange = ({ target: { value } }: { target: { value: string }; }) => {
    if (notes.length === 0)
      return;

    const header = value.split(/\r?\n/)[0];
    if (notes.length !== 0 && notes[activeNote].title !== header) {
      notes[activeNote].title = header;
      updateNotes([...notes]);
    }

    setActiveNoteContent(value);
    writeTextFile(notes[activeNote].location, value);
  };

  const setActiveNoteData = async (index: number) => {
    setActiveNote(index);

    if (notes.length === 0)
      setActiveNoteContent("");
    else {
      const contents = await readTextFile(notes[index].location);
      setActiveNoteContent(contents);
    }
  };

  useEffect(() => {
    const getNotesFromStorage = async () => {
      const myNotes = await getNotes();
      setNotes(myNotes);
    };

    getNotesFromStorage();
  }, []);

  return (
    <div className="container">
      <div className="container__left">
        <div className="container__left__header">
          <div className="container__left__header__title_and_logo">
            <GoNote size={36}></GoNote>
            <p>Notes</p>
          </div>
          <div className="container__left__header__action" onClick={addNote}>
            <GoDuplicate size={36}></GoDuplicate>
            <p>New Note</p>
          </div>
        </div>
        <div className="container__left__content">
          {notes.map((item, index) => (
            <div
              key={`${item.title}_${index}`}
              className={`container__left__content__row ${index === activeNote && "active"
                }`}
              onClick={() => setActiveNoteData(index)}
            >
              <div className="container__left__content__row__left">
                <p className="container__left__content__row__left__title">
                  {item.title || "Untitled"}
                </p>
                <p className="container__left__content__row__left__date">
                  {item.created_at}
                </p>
              </div>
              <GoTrash
                className="container__left__content__row__action"
                onClick={() => deleteNote(index)}
                size={36}></GoTrash>
            </div>
          ))}
        </div>
      </div>
      <div className="container__right">
        <p className="container__right__date">
          {notes[activeNote]?.created_at}
        </p>
        <textarea
          name="note_input"
          placeholder={"Lorem ipsum dolor, sit amet consectetur adipisicing elit."
            + " Accusamus, odio dolores veritatis iure ea eaque sint, possimus nostrum cumque ipsum recusandae sunt."
            + " Ratione deserunt labore nihil at sapiente vel voluptatibus!"}
          onChange={handleChange}
          value={activeNoteContent}
        ></textarea>
      </div>
    </div>
  );
}

export default App;
