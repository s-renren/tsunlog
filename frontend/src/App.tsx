import { use, useActionState, useRef } from "react";
import { Books, BooksJson, BookState } from "./domain/book";
import "./App.css";
import handleAddBook from "./bookActions";

async function fetchBooks() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/books");
  const data = (await response.json()) as BooksJson[];
  return data.map(
    (book) =>
      new Books(book.id, book.name, book.pages, book.nowPage, book.complete)
  );
}

const fetchBooksPromise = fetchBooks();

function App() {
  const initialBooks = use(fetchBooksPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const [bookState, updateBookState, isPending] = useActionState(
    async (
      prevState: BookState | undefined,
      formData: FormData
    ): Promise<BookState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      return handleAddBook(prevState, formData);
    },
    {
      allBooks: initialBooks,
    }
  );

  return (
    <>
      <div>
        <form action={updateBookState} ref={addFormRef}>
          <input type="text" name="bookName" placeholder="書籍名" />
          <input type="number" name="bookPages" placeholder="ページ数" />
          <button type="submit" disabled={isPending}>
            追加
          </button>
        </form>
        <div>
          <ul>
            {bookState.allBooks.map((book: Books) => {
              return <li key={book.id}>{book.name}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
