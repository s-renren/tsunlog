import { Books, BooksJson, BookState } from "./domain/book";

export const handleAddBook = async (
  prevState: BookState,
  formData: FormData
): Promise<BookState> => {
  const name = formData.get("bookName") as string;
  const pages = formData.get("bookPages") as string;
  if (!name || !pages) {
    throw new Error("Invalid form data");
  }
  const pagesNum = parseInt(pages);
  if (pagesNum <= 0) {
    throw new Error("ページ数は1以上である必要があります");
  }

  const response = await fetch("http://localhost:8080/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      pages: pagesNum,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add book");
  }

  const newBook: BooksJson = await response.json();
  return {
    ...prevState,
    allBooks: [...prevState.allBooks, newBook],
    filteredBooks: prevState.filteredBooks
      ? [...prevState.filteredBooks, newBook]
      : null,
  };
};

export const handleSearchBooks = async (
  prevState: BookState,
  formData: FormData
): Promise<BookState> => {
  const keyword = formData.get("keyword") as string;
  if (!keyword) {
    throw new Error("Invalid form data");
  }

  const response = await fetch(
    `http://localhost:8080/books?keyword=${keyword}`
  );
  const data = (await response.json()) as BooksJson[];
  const filteredBooks = data.map(
    (book) =>
      new Books(book.id, book.name, book.pages, book.nowPage, book.complete)
  );

  return {
    ...prevState,
    filteredBooks,
    keyword,
  };
};

export const handleUpdateBook = async (
  prevState: BookState,
  formData: FormData
): Promise<BookState> => {
  const id: number = Number(formData.get("id"));
  const name: string = formData.get("bookName") as string;
  const pages: number = Number(formData.get("pages"));
  const nowPage: number = Number(formData.get("nowPage"));
  const complete: boolean = formData.has("complete");

  const response = await fetch(`http://localhost:8080/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      pages,
      nowPage,
      complete,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update book");
  }
  const updatedBook = await response.json();
  const updatedBooks = prevState.allBooks.map((book) =>
    book.id === id ? updatedBook : book
  );
  const filteredBooks = prevState.filteredBooks?.map((book) =>
    book.id === id ? updatedBook : book
  );

  return {
    ...prevState,
    allBooks: updatedBooks,
    filteredBooks: filteredBooks || null,
  };
};
