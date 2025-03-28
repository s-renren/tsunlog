import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Books } from "./type/books.js";

const app = new Hono();

//テストデータ
const books: Books[] = [
  { id: 1, name: "book1", pages: 100, nowPage: 0, complete: false },
  { id: 2, name: "book2", pages: 200, nowPage: 0, complete: false },
  { id: 3, name: "book3", pages: 300, nowPage: 0, complete: false },
];

// const books: Books[] = [];

app.get("/books", async (c) => {
  const query = c.req.query();
  const keyword = query.keyword;

  if (keyword) {
    return c.json(books.filter((book) => book.name.includes(keyword)));
  }

  return c.json(books);
});

app.post("/books", async (c) => {
  const body = await c.req.json();
  const name = body.name;
  const pages = body.pages;

  if (name === "") {
    return c.json({ error: "書籍名は必須です" }, 400);
  } else if (!pages) {
    return c.json({ error: "ページ数は必須です" }, 400);
  }

  const newBook: Books = {
    id: books.length + 1,
    name,
    pages,
    nowPage: 0,
    complete: false,
  };

  books.push(newBook);
  return c.json(newBook);
});

app.put("books/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const pages = body.pages;
  const nowPage = body.nowPage;
  const complete = body.complete;

  const book = books.find((book) => book.id === Number(id));
  if (!book) {
    return c.json({ error: "書籍が見つかりません" }, 404);
  }

  book.pages = pages;
  book.nowPage = nowPage;
  book.complete = complete;
  return c.json(book);
});

app.get("/", (c) => {
  console.log("a");
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
