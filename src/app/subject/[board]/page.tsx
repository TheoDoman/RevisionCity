import { redirect } from 'next/navigation';

const VALID_BOARDS = ['cambridge', 'edexcel'];

export default async function SubjectBoardPage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const { board } = await params;

  // If this is a valid board name with no slug, redirect to subjects list
  if (VALID_BOARDS.includes(board)) {
    redirect('/subjects');
  }

  // Legacy slug: e.g. /subject/biology → /subject/cambridge/biology
  // Legacy edexcel slug: e.g. /subject/biology-edexcel → /subject/edexcel/biology
  if (board.endsWith('-edexcel')) {
    redirect(`/subject/edexcel/${board.replace(/-edexcel$/, '')}`);
  } else {
    redirect(`/subject/cambridge/${board}`);
  }
}
