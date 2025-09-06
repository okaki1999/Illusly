import { StackClientApp } from '@stackframe/stack'

// Stack AuthのsignOutメソッドを型安全に呼び出すためのヘルパー関数
export async function signOut(app: StackClientApp): Promise<void> {
  // Stack AuthのsignOutメソッドが存在するかチェック
  const appWithSignOut = app as StackClientApp & { signOut: () => Promise<void> }

  if ('signOut' in app && typeof appWithSignOut.signOut === 'function') {
    await appWithSignOut.signOut()
  } else {
    // フォールバック: Cookieをクリアしてリダイレクト
    document.cookie = 'stack-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }
}
