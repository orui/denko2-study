# denko2-study

第二種電気工事士・学科試験（2026年10月25日 筆記方式）の学習ダッシュボード。

- 本番はNAS（Tailscale経由）：http://dxp2800:8080/study/ 。過去問200選は http://dxp2800:8080/drill/
- 反映は `sh nas/deploy.sh`（Webサーバーの設定も送るときは `--compose` を付け、NASで `sudo docker compose up -d`）
- 記録はNASの同期サーバー（nas/sync.py、保存先は /volume1/docker/private-web/data）で端末間に同期する。ページ側は nas/sync.js
- 28日間の日別カリキュラム、毎日の「覚えること」（163項目）と出典ページ、練習問題168問
- 暗記カード：1枚＝1問1答で414枚（cards.js）。すべて図付き（figs.js＝記号・図解、tools.js＝工具の線画、どちらもインラインSVG）。スマホは日別ページでもカード表示、スワイプで「覚えた／まだ」
- 過去問3回分（令和7年度上期・下期、令和8年度上期）の解答入力と自動採点
  - 問題・解答は[一般財団法人 電気技術者試験センター](https://www.shiken.or.jp/construction/second/qa/)の公表資料へのリンク
- 進捗はブラウザのlocalStorageにも保存し、NASと項目ごとに新しい方を採用して統合する

教材PDFはリポジトリに含めない。Macのローカルで `index.html` を開いたときだけ、`../personal/book/電気工事士/book.pdf` へのページリンクが有効になる。
