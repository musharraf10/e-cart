import { ProductQuestion } from "../models/productQuestion.model.js";

export async function listProductQuestions(req, res) {
  const { productId } = req.params;
  const questions = await ProductQuestion.find({ product: productId })
    .populate("answeredBy", "name")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Keep response shape stable for the existing ProductQandA component
  res.json(
    questions.map((q) => ({
      _id: q._id,
      question: q.question,
      answer: q.answer || null,
      verified: Boolean(q.verified && q.answer),
      answeredBy: q.answeredBy?.name || null,
      askedBy: q.user?.name || null,
      createdAt: q.createdAt,
    })),
  );
}

export async function createProductQuestion(req, res) {
  const { productId } = req.params;
  const questionText = req.body?.question;

  if (!questionText || !String(questionText).trim()) {
    res.status(400);
    throw new Error("Question text is required");
  }

  const q = await ProductQuestion.create({
    product: productId,
    user: req.user._id,
    question: String(questionText).trim(),
    verified: false,
  });

  res.status(201).json({
    _id: q._id,
    question: q.question,
    answer: null,
    verified: false,
    answeredBy: null,
    askedBy: req.user?.name || null,
    createdAt: q.createdAt,
  });
}

export async function answerProductQuestion(req, res) {
  const { id } = req.params;
  const answerText = req.body?.answer;

  if (!answerText || !String(answerText).trim()) {
    res.status(400);
    throw new Error("Answer text is required");
  }

  const q = await ProductQuestion.findById(id);
  if (!q) {
    res.status(404);
    throw new Error("Question not found");
  }

  q.answer = String(answerText).trim();
  q.answeredBy = req.user._id;
  q.verified = req.user?.role === "admin";
  await q.save();

  const updated = await ProductQuestion.findById(q._id)
    .populate("answeredBy", "name")
    .lean();

  res.json({
    _id: updated._id,
    question: updated.question,
    answer: updated.answer || null,
    verified: Boolean(updated.verified && updated.answer),
    answeredBy: updated.answeredBy?.name || null,
    askedBy: null,
    createdAt: updated.createdAt,
  });
}

// Backward-compatible export name (if referenced elsewhere)
export const adminAnswerProductQuestion = answerProductQuestion;

