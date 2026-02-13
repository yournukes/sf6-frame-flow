import { GoogleGenAI } from "@google/genai";
import { Move, Combo, Situation } from '../types';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getStrategyAdvice = async (
  contextType: 'move' | 'combo' | 'situation',
  data: Move | Combo | Situation,
  characterName: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "APIキーが見つかりません。環境変数にGemini APIキーを設定してください。";

  let prompt = "";
  
  if (contextType === 'move') {
    const move = data as Move;
    prompt = `私はストリートファイター6を${characterName}でプレイしています。
    以下の技についてのアドバイスをください: "${move.name}" (コマンド: ${move.command})。
    フレームデータ: 発生 ${move.frames.startup}F, ガード時 ${move.frames.onBlock}F, ヒット時 ${move.frames.onHit}F。
    この技を立ち回りや固めで効果的に使うための戦略的なコツを3つ、簡潔に教えてください。日本語で回答してください。`;
  } else if (contextType === 'combo') {
    const combo = data as Combo;
    prompt = `私はストリートファイター6を${characterName}でプレイしています。
    以下のコンボについて分析してください: "${combo.name}"。
    ダメージ: ${combo.totalDamage}。使用ゲージ: ${combo.meterCost}本。終了後有利フレーム: ${combo.endSituationAdvantage}F。
    このコンボを使うべき最適な状況（例：バーンアウト中の崩し、画面端への運びなど）はどこですか？またリスクはありますか？日本語で回答してください。`;
  } else if (contextType === 'situation') {
    const sit = data as Situation;
    prompt = `私はストリートファイター6を${characterName}でプレイしています。
    現在以下の状況にあります: "${sit.name}"。
    状況説明: ${sit.description}。
    私の有利フレーム: ${sit.advantage > 0 ? '+' : ''}${sit.advantage}F。
    このフレーム状況を活かして、どのような起き攻めや崩しの選択肢（セットプレイ）を展開するのが有効ですか？2つほど提案してください。日本語で回答してください。`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "アドバイスを生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "エラーが発生しました。通信状況やAPI制限を確認してください。";
  }
};