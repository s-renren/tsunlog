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
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
        <form
          action={updateBookState}
          ref={addFormRef}
          className="mb-6 space-y-4"
        >
          <input type="hidden" name="formType" value="add" />
          <input
            type="text"
            name="bookName"
            placeholder="書籍名"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="bookPages"
            placeholder="ページ数"
            min="0"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            追加
          </button>
        </form>

        <form
          ref={searchRef}
          action={updateBookState}
          className="mb-6 space-y-4"
        >
          <input type="hidden" name="formType" value="search" />
          <input
            type="text"
            name="keyword"
            placeholder="書籍名で検索"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            検索
          </button>
        </form>

        {isClick && selectedBook && (
          <form
            id="formContent"
            action={updateBookState}
            className="mb-6 space-y-4 p-4 bg-gray-100 rounded-md"
          >
            <input type="hidden" name="formType" value="update" />
            <input type="hidden" name="id" value={selectedBook.id} />
            <input
              type="text"
              name="bookName"
              defaultValue={selectedBook.name}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="pages"
              defaultValue={selectedBook.pages}
              min="0"
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="nowPage"
              defaultValue={selectedBook.nowPage}
              min="0"
              max={selectedBook.pages}
              className="w-full p-2 border rounded"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="complete"
                defaultChecked={selectedBook.complete}
              />
              <label htmlFor="bookComplete">完了</label>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              更新
            </button>
          </form>
        )}

        <div>
          <ul className="space-y-4">
            {books?.map((book: Books) => {
              const remainingPages = book.pages - book.nowPage;
              const progress = Math.round((book.nowPage / book.pages) * 100);

              return (
                <li
                  key={book.id}
                  onClick={() => handleClick(book.id)}
                  className="p-4 bg-gray-100 rounded-md shadow cursor-pointer hover:bg-gray-200 transition"
                >
                  <span className="font-bold">{book.name}</span> - {book.pages}
                  ページ
                  <br />
                  <span className="text-sm text-gray-600">
                    現在: {book.nowPage}ページ | 残り: {remainingPages}ページ
                  </span>
                  <span
                    className={`ml-2 font-bold ${
                      book.complete ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {book.complete ? "読了" : "未読了"}
                  </span>
                  <div className="mt-2 h-3 w-full bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {progress}% 完了
                  </span>
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
