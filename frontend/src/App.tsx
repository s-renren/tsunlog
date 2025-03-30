import { use, useState, useTransition } from "react";
import "./App.css";
import { Books, BooksJson } from "./domain/book";

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
  const [books, setBooks] = useState<Books[]>(initialBooks);
  const [bookName, setBookName] = useState<string>("");
  const [bookPages, setBookPages] = useState<number>(0);
  const [bookNowPage, setBookNowPage] = useState<number>(0);
  const [bookComplete, setBookComplete] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleAddBook = () => {
    startTransition(async () => {
      const response = await fetch("http://localhost:8080/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bookName,
          pages: bookPages,
          nowPage: bookNowPage,
          complete: bookComplete,
        }),
      });
      const data = (await response.json()) as BooksJson;
      setBooks((prev) => [
        ...prev,
        new Books(data.id, data.name, data.pages, data.nowPage, data.complete),
      ]);
    });
  };

  return (
    <>
      <div>
        <form>
          <input
            type="text"
            name="bookName"
            placeholder="書籍名"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
          <input
            type="number"
            name="bookPages"
            placeholder="ページ数"
            value={bookPages}
            onChange={(e) => setBookPages(Number(e.target.value))}
          />
          <input
            type="number"
            name="bookNowPage"
            placeholder="現在のページ数"
            value={bookNowPage}
            onChange={(e) => setBookNowPage(Number(e.target.value))}
          />
          <input
            type="checkbox"
            name="bookComplete"
            checked={bookComplete}
            onChange={(e) => setBookComplete(e.target.checked)}
          />
          <label htmlFor="bookComplete">完了</label>

          <button type="submit" disabled={isPending} onClick={handleAddBook}>
            追加
          </button>
        </form>
        <div>
          <ul>
            {books.map((book: Books) => {
              return <li key={book.id}>{book.name}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
