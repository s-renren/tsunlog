class Books {
  constructor(
    public id: number,
    public name: string,
    public pages: number,
    public nowPage: number,
    public complete: boolean
  ) {}
}

type BooksJson = {
  id: number;
  name: string;
  pages: number;
  nowPage: number;
  complete: boolean;
};

export type { BooksJson };
export { Books };
