import { use, useActionState, useRef, useState } from "react";
import { Books, BooksJson, BookState } from "./domain/book";
import "./App.css";
import {
  handleAddBook,
  handleSearchBooks,
  handleUpdateBook,
} from "./bookActions";

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
  const searchRef = useRef<HTMLFormElement>(null);
  const [isClick, setIsClick] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Books | null>(null);
  const [bookState, updateBookState, isPending] = useActionState(
    async (
      prevState: BookState | undefined,
      formData: FormData
    ): Promise<BookState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      const action = formData.get("formType") as string;

      const actionHandlers = {
        add: () => handleAddBook(prevState, formData),
        search: () => handleSearchBooks(prevState, formData),
        update: () => handleUpdateBook(prevState, formData),
      } as const;

      if (action !== "add" && action !== "search" && action !== "update") {
        throw new Error("Invalid action");
      }

      if (action === "update") {
        setIsClick(!isClick);
      }

      return actionHandlers[action]();
    },
    {
      allBooks: initialBooks,
      filteredBooks: null,
      keyword: "",
    }
  );

  const books = bookState.filteredBooks || bookState.allBooks;

  const handleClick = (id: number) => {
    const book = books.find((book) => book.id === id);
    if (book) {
      setSelectedBook(book);
    }
    setIsClick(!isClick);
  };

  return (
    <>
      <div>
        <form action={updateBookState} ref={addFormRef}>
          <input type="hidden" name="formType" value="add" />
          <input type="text" name="bookName" placeholder="書籍名" />
          <input type="number" name="bookPages" placeholder="ページ数" />
          <button type="submit" disabled={isPending}>
            追加
          </button>
        </form>
        <form ref={searchRef} action={updateBookState}>
          <input type="hidden" name="formType" value="search" />
          <input type="text" name="keyword" placeholder="書籍名で検索" />
          <button type="submit" disabled={isPending}>
            検索
          </button>
        </form>
        {isClick && selectedBook && (
          <form id="formContent" action={updateBookState}>
            <input type="hidden" name="formType" value="update" />
            <input type="hidden" name="id" value={selectedBook.id} />
            <input
              type="text"
              name="bookName"
              defaultValue={selectedBook.name}
            />
            <input
              type="number"
              name="pages"
              defaultValue={selectedBook.pages}
            />
            <input
              type="number"
              name="nowPage"
              defaultValue={selectedBook.nowPage}
            />
            <input
              type="checkbox"
              name="complete"
              defaultChecked={selectedBook.complete}
            />
            <label htmlFor="bookComplete">完了</label>
            <button type="submit" disabled={isPending}>
              更新
            </button>
          </form>
        )}
        <div>
          <ul>
            {books?.map((book: Books) => {
              return (
                <li key={book.id} onClick={() => handleClick(book.id)}>
                  {book.name}
                  <form action={updateBookState}>
                    <input type="hidden" name="formType" value="update" />
                    <input type="hidden" name="id" value={book.id} />
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
