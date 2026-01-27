import { NextRequest, NextResponse } from 'next/server';
import { getAllRevisionContent } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subtopicId = searchParams.get('subtopicId');
  const topicId = searchParams.get('topicId');

  if (!subtopicId || !topicId) {
    return NextResponse.json(
      { error: 'Missing subtopicId or topicId' },
      { status: 400 }
    );
  }

  try {
    const content = await getAllRevisionContent(subtopicId, topicId);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
