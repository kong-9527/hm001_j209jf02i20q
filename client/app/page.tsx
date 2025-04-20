import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">欢迎来到花园网站</h1>
      <div className="text-center">
        <p className="mb-4">这是一个使用Next.js和Node.js构建的花园展示网站</p>
        <Link href="/pages/home" className="text-blue-500 hover:text-blue-700 underline">
          进入主页
        </Link>
      </div>
    </div>
  )
} 