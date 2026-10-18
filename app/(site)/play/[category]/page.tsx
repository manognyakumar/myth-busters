import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizGame } from "@/components/quiz/QuizGame";
import { getCategory, QUIZ_CATEGORY_IDS, type QuizCategoryId } from "@/lib/categories";

export function generateStaticParams() {
  return QUIZ_CATEGORY_IDS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const c = getCategory((await params).category);
  return { title: c?.title ?? "Quiz" };
}

export default async function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c || !QUIZ_CATEGORY_IDS.includes(c.id as QuizCategoryId)) notFound();
  return <QuizGame category={c} />;
}
