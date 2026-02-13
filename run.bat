@echo off
rem 文字コードをUTF-8に設定（文字化け防止）
chcp 65001 > nul

echo ========================================================
echo  FrameFlow - SF6 Tech Keeper 開発サーバー起動スクリプト
echo ========================================================
echo.

rem package.jsonの存在確認
if not exist "package.json" (
    echo [エラー] package.json が見つかりません。
    echo プロジェクトのルートディレクトリで実行してください。
    pause
    exit /b 1
)

echo 依存関係をインストールしています...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [エラー] npm install に失敗しました。
    echo Node.js がインストールされているか、ネットワーク接続を確認してください。
    pause
    exit /b %errorlevel%
)

echo.
echo 開発サーバーを起動します...
echo ブラウザが自動的に開かない場合は、表示されるURLにアクセスしてください。
echo (終了するには Ctrl+C を押して Y を入力してください)
echo.

call npm start
if %errorlevel% neq 0 (
    echo.
    echo [エラー] サーバーの起動中にエラーが発生しました。
    pause
    exit /b %errorlevel%
)

pause