/**
 * Vercel サーバーレス関数
 * Notion APIへのリクエストをプロキシする
 * CORSの制限を回避するため、フロントエンドの代わりにサーバー側でAPIを叩く
 */

export default async function handler(req, res) {
  // CORSヘッダーの設定（フロントエンドからのアクセスを許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // プリフライトリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTメソッド以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 環境変数からAPIキーとデータベースIDを取得
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'サーバー設定エラー: 環境変数が未設定です' });
  }

  try {
    /**
     * Notion APIへのリクエスト
     * 公開フラグ（公開）がオンのものだけをフィルタリング
     * 公開日の降順（新しい順）でソート
     */
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 公開フラグがオン（チェックされている）のものだけ表示
          filter: {
            property: '公開フラグ',
            checkbox: {
              equals: true,
            },
          },
          // 公開日の降順（新しい投稿が上に来る）
          sorts: [
            {
              property: '公開日',
              direction: 'descending',
            },
          ],
        }),
      }
    );

    if (!notionRes.ok) {
      const errorData = await notionRes.json();
      console.error('Notion API エラー:', errorData);
      return res.status(notionRes.status).json({ error: 'Notion APIエラー', detail: errorData });
    }

    const data = await notionRes.json();

    // Notionのレスポンスから必要なデータだけを抽出して返す
    const posts = data.results.map((page) => {
      // 各プロパティを安全に取得するヘルパー
      const getText = (prop) => {
        if (!prop) return '';
        if (prop.type === 'title') {
          return prop.title.map((t) => t.plain_text).join('');
        }
        if (prop.type === 'rich_text') {
          return prop.rich_text.map((t) => t.plain_text).join('');
        }
        return '';
      };

      const getDate = (prop) => {
        if (!prop || prop.type !== 'date' || !prop.date) return null;
        return prop.date.start;
      };

      return {
        id: page.id,
        // 質問者の名前（タイトルプロパティ）
        name: getText(page.properties['質問者の名前']),
        // メッセージ内容
        message: getText(page.properties['メッセージ内容']),
        // 管理者の返信
        reply: getText(page.properties['管理者の返信']),
        // 公開日
        date: getDate(page.properties['公開日']),
      };
    });

    return res.status(200).json({ posts });
  } catch (err) {
    console.error('サーバーエラー:', err);
    return res.status(500).json({ error: 'サーバー内部エラー' });
  }
}
