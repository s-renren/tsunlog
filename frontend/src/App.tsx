import { use } from "react";
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
  return (
    <>
      <div>
        <div>
          <ul>
            {initialBooks.map((book: Books) => {
              return <li key={book.id}>{book.name}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
