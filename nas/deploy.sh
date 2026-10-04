#!/bin/sh
# 学習サイトをNAS（http://dxp2800:8080/）へ反映する。Macで実行：sh nas/deploy.sh
#   /study/  学習ダッシュボード（このリポジトリ）＋ 本のPDF
#   /drill/  過去問200選（personal/book/電気工事士/練習問題/drill）
#   /sync.js 同期の共通コード
# NASでは rsync が使えない（invalid path）ので tar で送る。--compose を付けるとWebサーバーの設定も送る
set -e
cd "$(dirname "$0")/.."
BOOK="../personal/book/電気工事士"
WEB=/volume2/web
export COPYFILE_DISABLE=1

ssh nas "mkdir -p $WEB/study"
tar --no-xattrs -cf - index.html figs.js tools.js cards.js 2>/dev/null | ssh nas "tar -xf - -C $WEB/study 2>/dev/null"
tar --no-xattrs -C nas -cf - sync.js 2>/dev/null | ssh nas "tar -xf - -C $WEB 2>/dev/null"
tar --no-xattrs -C "$BOOK/練習問題" --exclude .DS_Store -cf - drill 2>/dev/null | ssh nas "tar -xf - -C $WEB 2>/dev/null"
# 本のPDF（272MB）は、NASに無いか中身が変わったときだけ送る
LOCAL_SIZE=$(stat -f %z "$BOOK/book.pdf")
REMOTE_SIZE=$(ssh nas "stat -c %s $WEB/study/book.pdf 2>/dev/null || echo 0")
if [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
  echo "book.pdf を送ります（約270MB）"
  tar --no-xattrs -C "$BOOK" -cf - book.pdf 2>/dev/null | ssh nas "tar -xf - -C $WEB/study 2>/dev/null"
fi

if [ "$1" = "--compose" ]; then
  D=/volume1/docker/private-web
  ssh nas "cp -n $D/docker-compose.yaml $D/docker-compose.yaml.orig 2>/dev/null || true; mkdir -p $D/data"
  tar --no-xattrs -C nas -cf - docker-compose.yaml default.conf sync.py 2>/dev/null | ssh nas "tar -xf - -C $D 2>/dev/null"
  echo "設定を送りました。NASで次を実行してください： cd $D && sudo docker compose up -d"
fi
echo "反映しました： http://dxp2800:8080/study/"
