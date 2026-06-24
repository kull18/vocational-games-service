import { pool } from '../../../../core/database/pgPool';
import { Game } from '../../../../domain/entities/Game';
import { Question, QuestionOption } from '../../../../domain/entities/Question';
import { GameSession } from '../../../../domain/entities/GameSession';
import { GameResult } from '../../../../domain/entities/GameResult';
import { GameRepositoryPort } from '../../../../application/ports/outputs/GameRepositoryPort';

export class PostgresGameRepository implements GameRepositoryPort {
  async findActiveGames(): Promise<Game[]> {
    const query = `
      SELECT id, title, description, category, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM games
      WHERE is_active = true
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => new Game(
      row.id,
      row.title,
      row.description,
      row.category,
      row.isActive,
      row.createdAt,
      row.updatedAt
    ));
  }

  async findGameById(id: string): Promise<Game | null> {
    const query = `
      SELECT id, title, description, category, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM games
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Game(
      row.id,
      row.title,
      row.description,
      row.category,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  async findQuestionsByGameId(gameId: string): Promise<Question[]> {
    const query = `
      SELECT id, game_id as "gameId", text, type, options, created_at as "createdAt"
      FROM questions
      WHERE game_id = $1
      ORDER BY created_at ASC;
    `;
    const { rows } = await pool.query(query, [gameId]);
    return rows.map((row) => new Question(
      row.id,
      row.gameId,
      row.text,
      row.type,
      (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) as QuestionOption[],
      row.createdAt
    ));
  }

  async findQuestionById(id: string): Promise<Question | null> {
    const query = `
      SELECT id, game_id as "gameId", text, type, options, created_at as "createdAt"
      FROM questions
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Question(
      row.id,
      row.gameId,
      row.text,
      row.type,
      (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) as QuestionOption[],
      row.createdAt
    );
  }

  async createSession(session: GameSession): Promise<void> {
    const query = `
      INSERT INTO game_sessions (id, user_id, game_id, status, started_at, finished_at)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    await pool.query(query, [
      session.id,
      session.userId,
      session.gameId,
      session.status,
      session.startedAt,
      session.finishedAt,
    ]);
  }

  async findSessionById(id: string): Promise<GameSession | null> {
    const query = `
      SELECT id, user_id as "userId", game_id as "gameId", status, started_at as "startedAt", finished_at as "finishedAt"
      FROM game_sessions
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new GameSession(
      row.id,
      row.userId,
      row.gameId,
      row.status,
      row.startedAt,
      row.finishedAt
    );
  }

  async saveAnswer(
    sessionId: string,
    questionId: string,
    selectedOptionId: string,
    rawData?: any
  ): Promise<void> {
    const query = `
      INSERT INTO student_answers (session_id, question_id, selected_option_id, raw_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_id, question_id)
      DO UPDATE SET selected_option_id = EXCLUDED.selected_option_id, raw_data = EXCLUDED.raw_data;
    `;
    const rawDataJson = rawData ? JSON.stringify(rawData) : null;
    await pool.query(query, [sessionId, questionId, selectedOptionId, rawDataJson]);
  }

  async findAnswersBySessionId(
    sessionId: string
  ): Promise<{ questionId: string; selectedOptionId: string; rawData?: any }[]> {
    const query = `
      SELECT question_id as "questionId", selected_option_id as "selectedOptionId", raw_data as "rawData"
      FROM student_answers
      WHERE session_id = $1;
    `;
    const { rows } = await pool.query(query, [sessionId]);
    return rows.map((row) => ({
      questionId: row.questionId,
      selectedOptionId: row.selectedOptionId,
      rawData: typeof row.rawData === 'string' ? JSON.parse(row.rawData) : row.rawData,
    }));
  }

  async saveResult(result: GameResult): Promise<void> {
    const query = `
      INSERT INTO game_results (id, session_id, user_id, game_id, scores)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (session_id)
      DO UPDATE SET scores = EXCLUDED.scores;
    `;
    const scoresJson = JSON.stringify(result.scores);
    await pool.query(query, [
      result.id,
      result.sessionId,
      result.userId,
      result.gameId,
      scoresJson,
    ]);
  }

  async updateSessionStatus(
    sessionId: string,
    status: string,
    finishedAt: Date | null
  ): Promise<void> {
    const query = `
      UPDATE game_sessions
      SET status = $2, finished_at = $3
      WHERE id = $1;
    `;
    await pool.query(query, [sessionId, status, finishedAt]);
  }

  async findResultsByUserId(userId: string): Promise<GameResult[]> {
    const query = `
      SELECT id, session_id as "sessionId", user_id as "userId", game_id as "gameId", scores, created_at as "createdAt", updated_at as "updatedAt"
      FROM game_results
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows.map((row) => new GameResult(
      row.id,
      row.sessionId,
      row.userId,
      row.gameId,
      (typeof row.scores === 'string' ? JSON.parse(row.scores) : row.scores) as Record<string, number>,
      row.createdAt,
      row.updatedAt
    ));
  }
}
